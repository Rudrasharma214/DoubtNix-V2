import { sendOtpEmail } from '../templates/otp.template.js';
import { sendWelcomeEmail } from '../templates/welcome.template.js';
import eventBus from './eventBus.js';
import { EVENTS } from './events.js';
import logger from '../config/logger.js';

eventBus.on(EVENTS.EMAIL_VERIFICATION, async ({ email, otp }) => {
  try {
    await sendOtpEmail({
      to: email,
      otp,
      title: 'Verify your email',
      description: 'Welcome to DoubtNix! Please use the OTP below to verify your email address.',
    });
  } catch (err) {
    logger.error('Email verification failed', err);
  }
});

eventBus.on(EVENTS.WELCOME_EMAIL, async (user) => {
  try {
    await sendWelcomeEmail(user);
  } catch (err) {
    logger.error('Welcome email failed', err);
  }
});

eventBus.on(EVENTS.LOGIN_OTP, async ({ email, otp }) => {
    try {
        await sendOtpEmail({
            to: email,
            otp,
            title: 'Login OTP Verification',
            description: 'For security reasons, please use the OTP below to complete your login.',
        });
    } catch (err) {
        logger.error('Login OTP email failed', err);
    }   
});
