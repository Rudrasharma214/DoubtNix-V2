import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import STATUS from "../constants/statusCode.js";
import OTP from "../models/Otp.model.js";
import { generateOtp } from "../utils/generateOtp.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import { env } from "../config/env.js";
import { verifyOtp } from "../utils/otpCompare.js";
import eventBus from "../events/eventBus.js";

// Hash refresh token using crypto (faster than bcrypt)
const hashRefreshToken = (token) => {
  return crypto
    .createHmac('sha256', env.JWT_REFRESH_SECRET)
    .update(token)
    .digest('hex');
};

// Verify refresh token using crypto
const verifyRefreshToken = (plainToken, hashedToken) => {
  const computed = crypto
    .createHmac('sha256', env.JWT_REFRESH_SECRET)
    .update(plainToken)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hashedToken));
};

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

  const refreshToken = generateRefreshToken({ userId });
  const accessToken = await generateAccessToken({ userId });
  const hashedRefresh = hashRefreshToken(refreshToken);

  const [accessTokenResult] = await Promise.all([
    Promise.resolve(accessToken),
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
  const accessToken = await generateAccessToken({ userId: user._id });
  const hashedRefresh = hashRefreshToken(refreshToken);

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
  const accessToken = await generateAccessToken({ userId });
  const hashedRefresh = hashRefreshToken(refreshToken);

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

    let isValid = false;
    try {
      // Try crypto verification first (new method)
      isValid = verifyRefreshToken(incomingRefreshToken, user.refreshToken);
    } catch (error) {
      return {
        success: false,
        status: STATUS.UNAUTHORIZED,
        message: "Invalid refresh token",
      };
    };

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

    user.refreshToken = hashRefreshToken(newRefreshToken);
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
  const user = await User.findById(userId).select('-password -refreshToken -updatedAt -createdAt -isEmailVerified -lastLogin');
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
    data: { userId: user._id },
  };
};

export const resetPassword = async (userId, otp, newPassword) => {
  const record = await OTP.findOneAndDelete({ userId }, { sort: { createdAt: -1 } });
  if (!record) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'OTP expired or invalid',
    };
  }

  const plainOtp = String(otp || '').trim();

  const isValid = verifyOtp(plainOtp, record.otp);
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

export const resendVerificationOtp = async (email) => {
  if (!email) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'Email is required',
    };
  }

  const user = await User.findOne({ email });
  if (!user) {
    return {
      success: false,
      status: STATUS.NOT_FOUND,
      message: 'If the user exists, a new OTP has been sent to the email',
    };
  }

  if (user.isEmailVerified) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'Email is already verified',
    };
  }

  const otp = generateOtp();

  await OTP.create({
    userId: user._id,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  eventBus.emit('verification.resend', {
    email: user.email,
    otp,
  });

  return {
    success: true,
    status: STATUS.OK,
    message: 'If the user exists, a new OTP has been sent to the email',
    data: { userId: user._id },
  };
};  

export const resendLoginOtp = async (id) => {
  if (!id) {
    return {
      success: false,
      status: STATUS.BAD_REQUEST,
      message: 'User ID is required',
    };
  };

  const user = await User.findById(id);
  if (!user) {
    return {
      success: false,
      status: STATUS.NOT_FOUND,
      message: 'User not found',
    };
  }

  const otp = await OTP.findOneAndDelete({ userId: id });
  const newOtp = generateOtp();

  await OTP.create({
    userId: user._id,
    otp: newOtp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  eventBus.emit('login.otp', {
    email: user.email,
    otp: newOtp,
  });
  return {
    success: true,
    status: STATUS.OK,
    message: 'OTP resent to email for verification',
    data: {
      userId: user._id,
    },
  };
};