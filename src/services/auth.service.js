import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import STATUS from "../constants/statusCode.js";
import OTP from "../models/Otp.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmailVerificationOtp } from "../utils/emailHelper/sendEmailVerificationOtp.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { env } from "../config/env.js";

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
  await sendEmailVerificationOtp(user.email, otp);

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

  await User.findByIdAndUpdate(userId, {
    isEmailVerified: true,
    lastLogin: new Date(),
  });

  await OTP.deleteOne({ _id: record._id });

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

export const refreshToken = async (incomingRefreshToken) => {
  try {
    // 1. Verify refresh token signature
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

    // 2. Fetch user
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

    // 3. Compare hashed refresh token
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

    // 4. Rotate tokens
    const newAccessToken = generateAccessToken({
      userId: user._id,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id,
    });

    // 5. Hash & store new refresh token
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