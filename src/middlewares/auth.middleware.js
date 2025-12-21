import jwt from "jsonwebtoken";
import STATUS from "../constants/statusCode.js";
import { env } from "../config/env.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Access token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    if (decoded.type !== "access") {
      return res.status(STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Invalid access token",
      });
    }

    // attach user info to request
    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Access token expired or invalid",
    });
  }
};

export const authenticateRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Refresh token missing",
    });
  }

  req.refreshToken = refreshToken;
  next();
};