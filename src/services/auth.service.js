import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import STATUS from "../constants/statusCode.js";
import OTP from "../models/Otp.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { env } from "../config/env.js";
import { sendOtpEmail } from "../templates/otp.template.js";
import { sendWelcomeEmail } from "../templates/welcome.template.js";


export const registerUser = async (data) => {
  if (!data.email || !data.password) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: "Email and password are required",
    };
  }

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    return {
      success: false,
      status: STATUS.CONFLICT,
      message: "Email already registered",
    };
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    isEmailVerified: false,
  });

  // Generate OTP
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 12);

  // Store OTP with TTL
  await OTP.create({
    userId: user._id,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  // Send email verification OTP
  await sendOtpEmail({
    to: user.email,
    otp,
    title: "Verify your email",
    description: "Welcome to DoubtNix! Please use the OTP below to verify your email address.",
  });

  return {
    success: true,
    status: STATUS.CREATED,
    message: "OTP sent to email. Please verify.",
    data: {
      userId: user._id,
    },
  };
};

export const verifyEmailOtp = async (userId, otp) => {
  const record = await OTP.findOne({ userId });
  if (!record) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: "OTP expired or invalid",
    };
  }

  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: "Invalid OTP",
    };
  }

  const user = await User.findByIdAndUpdate(userId, {
    isEmailVerified: true,
    lastLogin: new Date(),
  }, { new: true });

  await OTP.deleteOne({ _id: record._id });

  // Send welcome email
  sendWelcomeEmail(user);

  // generate tokens here
  const accessToken = generateAccessToken({ userId });
  const refreshToken = generateRefreshToken({ userId });

  // hash & store refresh token
  const hashedRefresh = await bcrypt.hash(refreshToken, 12);
  await User.findByIdAndUpdate(userId, {
    refreshToken: hashedRefresh,
  });

  return {
    success: true,
    status: STATUS.OK,
    message: "Email verified",
    data: { accessToken, refreshToken },
  };
};

export const loginUser = async (email, password) => {
  if (!email || !password) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: "Email and password are required",
    };
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: "Invalid email or password",
    };
  }

  // Compare password using model method
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: "Invalid email or password",
    };
  }

  if (!user.isEmailVerified) {
    return {
      success: false,
      status: STATUS.FORBIDDEN,
      message: "Email not verified",
    };
  }

  const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const lastLogin = user.lastLogin ? user.lastLogin.getTime() : 0;

  if (now - lastLogin > FIFTEEN_DAYS) {
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 12);

    await OTP.create({
      userId: user._id,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOtpEmail({
      to: user.email,
      otp,
      title: "Login OTP Verification",
      description: "For security reasons, please use the OTP below to complete your login.",
    });

    return {
      success: true,
      status: STATUS.OK,
      message: "OTP sent to email for verification",
      data: {
        requiresOtp: true,
        userId: user._id,
      },
    };
  }

  const accessToken = generateAccessToken({ userId: user._id });
  const refreshToken = generateRefreshToken({ userId: user._id });

  const hashedRefresh = await bcrypt.hash(refreshToken, 12);
  await User.findByIdAndUpdate(user._id, {
    refreshToken: hashedRefresh,
    lastLogin: new Date(),
  });

  return {
    success: true,
    status: STATUS.OK,
    message: "Login successful",
    data: {
      requiresOtp: false,
      accessToken,
      refreshToken,
    },
  };
};

export const verifyLoginOtp = async (userId, otp) => {
  const record = await OTP.findOne({ userId });
  if (!record) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: "OTP expired or invalid",
    };
  }
  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: "Invalid OTP",
    };
  }

  await User.findByIdAndUpdate(userId, {
    lastLogin: new Date(),
  });

  await OTP.deleteOne({ _id: record._id });

  const accessToken = generateAccessToken({ userId });
  const refreshToken = generateRefreshToken({ userId });

  const hashedRefresh = await bcrypt.hash(refreshToken, 12);
  await User.findByIdAndUpdate(userId, {
    refreshToken: hashedRefresh,
  });

  return {
    success: true,
    status: STATUS.OK,
    message: "Login successful",
    data: { accessToken, refreshToken },
  };
};

export const logoutUser = async (userId) => {
  const user = await User.findById(userId).select("+refreshToken");
  if (!user || !user.refreshToken) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: "User not logged in",
    };
  }

  user.refreshToken = null;
  await user.save();
  return {
    success: true,
    status: STATUS.OK,
    message: "Logout successful",
  };
};

export const refreshToken = async (incomingRefreshToken) => {
  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      env.JWT_REFRESH_SECRET
    );

    if (decoded.type !== "refresh") {
      return {
        success: false,
        status: STATUS.UNAUTHORIZED,
        message: "Invalid token type",
      };
    }

    const user = await User.findById(decoded.userId).select(
      "+refreshToken"
    );

    if (!user || !user.refreshToken) {
      return {
        success: false,
        status: STATUS.UNAUTHORIZED,
        message: "Session expired",
      };
    }

    const isValid = await bcrypt.compare(
      incomingRefreshToken,
      user.refreshToken
    );

    if (!isValid) {
      return {
        success: false,
        status: STATUS.UNAUTHORIZED,
        message: "Invalid refresh token",
      };
    }

    const newAccessToken = generateAccessToken({
      userId: user._id,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id,
    });

    user.refreshToken = await bcrypt.hash(newRefreshToken, 12);
    await user.save();

    return {
      success: true,
      status: STATUS.OK,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    };
  } catch (err) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: "Refresh token expired or invalid",
    };
  }
};