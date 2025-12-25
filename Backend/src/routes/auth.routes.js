import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', authController.register);
authRouter.post('/verify-email', authController.verifyEmail);

authRouter.post('/login', authController.login);
authRouter.post('/verify-login-otp', authController.verifyLoginOtp);

authRouter.post('/refresh-token', authController.refreshToken);
authRouter.post('/logout', authenticate, authController.logout);

authRouter.post('/change-password', authenticate, authController.changePassword);
authRouter.post('/forgot-password', authController.requestPasswordReset);
authRouter.post('/reset-password', authController.resetPassword);

authRouter.get('/me', authenticate, authController.getUserProfile);

export default authRouter;