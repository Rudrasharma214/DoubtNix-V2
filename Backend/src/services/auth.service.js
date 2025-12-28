import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import STATUS from "../constants/statusCode.js";
import OTP from "../models/Otp.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { env } from "../config/env.js";
import { verifyOtp } from "../utils/otpCompare.js";
import eventBus from "../events/eventBus.js";

export const registerUser = async (data) => {
  const exists = await User.exists({ email: data.email });
  if (exists) {
    return {
      success: false,
      status: STATUS.CONFLICT,
      message: 'Email already registered',
    };
  }

  const otp = generateOtp();

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    isEmailVerified: false,
  });

  await OTP.create({
    userId: user._id,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  eventBus.emit('email.verification', {
    email: user.email,
    otp,
  });

  return {
    success: true,
    status: STATUS.CREATED,
    message: 'OTP sent to email. Please verify your email.',
    data: { userId: user._id },
  };
};

export const verifyEmailOtp = async (userId, otp) => {
  const record = await OTP.findOne({ userId });
  if (!record) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'OTP expired or invalid',
    };
  }

  const isValid = verifyOtp(otp, record.otp);
  if (!isValid) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: 'Invalid OTP',
    };
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isEmailVerified: true,
      lastLogin: new Date(),
    },
    { new: true }
  );

  const [accessToken, refreshToken, hashedRefresh] = await Promise.all([
    generateAccessToken({ userId }),
    generateRefreshToken({ userId }),
    bcrypt.hash(generateRefreshToken({ userId }), 10),
  ]);

  await User.findByIdAndUpdate(userId, {
    refreshToken: hashedRefresh,
  });

  eventBus.emit('email.welcome', user);

  return {
    success: true,
    status: STATUS.OK,
    message: 'Email verified',
    data: { accessToken, refreshToken },
  };
};

const FIFTEEN_DAYS = 15 * 24 * 60 * 60 * 1000;

export const loginUser = async (email, password) => {
  if (!email || !password) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'Email and password are required',
    };
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: 'Invalid email or password',
    };
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: 'Invalid email or password',
    };
  }

  if (!user.isEmailVerified) {
    return {
      success: false,
      status: STATUS.FORBIDDEN,
      message: 'Email not verified',
    };
  }

  const now = Date.now();
  const lastLogin = user.lastLogin?.getTime() || 0;

  if (now - lastLogin > FIFTEEN_DAYS) {
    const otp = generateOtp();

    await OTP.create({
      userId: user._id,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    eventBus.emit('login.otp', {
      email: user.email,
      otp,
    });

    return {
      success: true,
      status: STATUS.OK,
      message: 'OTP sent to email for verification',
      data: {
        requiresOtp: true,
        userId: user._id,
      },
    };
  }

  const refreshToken = generateRefreshToken({ userId: user._id });

  const [accessToken, hashedRefresh] = await Promise.all([
    generateAccessToken({ userId: user._id }),
    bcrypt.hash(refreshToken, 10),
  ]);

  await User.findByIdAndUpdate(user._id, {
    refreshToken: hashedRefresh,
    lastLogin: new Date(),
  });

  return {
    success: true,
    status: STATUS.OK,
    message: 'Login successful',
    data: {
      requiresOtp: false,
      accessToken,
      refreshToken,
    },
  };
};

export const verifyLoginOtp = async (userId, otp) => {
  const record = await OTP.findOneAndDelete({ userId });
  if (!record) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'OTP expired or invalid',
    };
  }

  const isValid = verifyOtp(otp, record.otp);
  if (!isValid) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: 'Invalid OTP',
    };
  }

  const refreshToken = generateRefreshToken({ userId });

  const [accessToken, hashedRefresh] = await Promise.all([
    generateAccessToken({ userId }),
    bcrypt.hash(refreshToken, 10),
  ]);

  await User.findByIdAndUpdate(userId, {
    refreshToken: hashedRefresh,
    lastLogin: new Date(),
  });

  return {
    success: true,
    status: STATUS.OK,
    message: 'Login successful',
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

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken');
  if (!user) {
    return {
      success: false,
      status: STATUS.NOT_FOUND,
      message: 'User not found',
    };
  };

  return {
    success: true,
    status: STATUS.OK,
    message: 'User profile fetched successfully',
    data: user,
  };
  
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    return {
      success: false,
      status: STATUS.NOT_FOUND,
      message: 'User not found',
    };
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: 'Current password is incorrect',
    };
  }

  user.password = newPassword;
  await user.save();
  
  return {
    success: true,
    status: STATUS.OK,
    message: 'Password changed successfully',
  };
};

export const requestPasswordReset = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    return {
      success: false,
      status: STATUS.NOT_FOUND,
      message: 'User with this email does not exist',
    };
  }

  const otp = generateOtp();

  await OTP.create({
    userId: user._id,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  eventBus.emit('password.reset', {
    email: user.email,
    otp,
  });
  return {
    success: true,
    status: STATUS.OK,
    message: 'If email exists, OTP has been sent for password reset',
  };
};

export const resetPassword = async (userId, otp, newPassword) => {
  const record = await OTP.findOneAndDelete({ userId });
  if (!record) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'OTP expired or invalid',
    };
  }

  const isValid = verifyOtp(otp, record.otp);
  if (!isValid) {
    return {
      success: false,
      status: STATUS.UNAUTHORIZED,
      message: 'Invalid OTP',
    };
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    return {
      success: false,
      status: STATUS.NOT_FOUND,
      message: 'User not found',
    };
  }

  user.password = newPassword;
  await user.save();

  return {
    success: true,
    status: STATUS.OK,
    message: 'Password reset successful',
  };
};