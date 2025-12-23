import crypto from 'crypto';
import { env } from '../config/env.js';

export const verifyOtp = (plainOtp, hashedOtp) => {
  const computed = crypto
    .createHmac('sha256', env.OTP_SECRET)
    .update(plainOtp)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(computed),
    Buffer.from(hashedOtp)
  );
};
