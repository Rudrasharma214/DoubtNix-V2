import { sendResponse, sendErrorResponse } from "../utils/Response.js";
import * as authService from "../services/auth.service.js";
import STATUS from "../constants/statusCode.js";


export const register = async (req, res, next) => {
  try {
    const userData = req.body;
    if (!userData.email || !userData.password) {
      return {
        success: false,
        status: STATUS.BAD_REQUEST,
        message: "Email and password are required",
      };
    }

    const result = await authService.registerUser(userData);

    if (!result.success) {
      sendErrorResponse(res, result.status, result.message, result.errors);
    };

    sendResponse(res, result.status, result.message, result.data);
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const result = await authService.verifyEmailOtp(userId, otp);

    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    }

    const { accessToken, refreshToken } = result.data;

    // set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(
      res,
      result.status,
      result.message,
      accessToken
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    if (!result.success) {
      return sendErrorResponse(res, result.status, result.message, result.errors);
    }

    const { refreshToken } = result.data;

    // set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, result.status, result.message, result.data);
  } catch (error) {
    next(error);
  }
};

export const verifyLoginOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const result = await authService.verifyLoginOtp(userId, otp);

    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    };

    const { accessToken, refreshToken } = result.data;

    // set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(
      res,
      result.status,
      result.message,
      accessToken
    );
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.userId;
    const result = await authService.logoutUser(userId);

    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    }
    // clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    sendResponse(res, result.status, result.message, null);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    // refresh token should come from httpOnly cookie
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return sendErrorResponse(
        res,
        STATUS.UNAUTHORIZED,
        "Refresh token missing",
        null
      );
    }

    const result = await authService.refreshToken(refreshToken);

    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    }

    // set new refresh token in cookie
    res.cookie("refreshToken", result.data.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // must match refresh expiry
    });

    sendResponse(
      res,
      STATUS.OK,
      "Token refreshed successfully",
      {
        accessToken: result.data.accessToken,
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.user;

    const result = await authService.getUserProfile(id);

    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    }

    sendResponse(res, result.status, result.message, result.data);
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(userId, currentPassword, newPassword);
    
    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    }

    sendResponse(res, result.status, result.message, null);
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);

    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    }

    sendResponse(res, result.status, result.message, null);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const result = await authService.resetPassword(userId, otp, newPassword);

    if (!result.success) {
      return sendErrorResponse(
        res,
        result.status,
        result.message,
        result.errors || null
      );
    }

    sendResponse(res, result.status, result.message, null);
  } catch (error) {
    next(error);
  }
};