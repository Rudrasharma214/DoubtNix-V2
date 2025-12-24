import mongoose from 'mongoose';
import crypto from 'crypto';
import { env } from '../config/env.js';

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

otpSchema.pre('save', function () {
  if (!this.isModified('otp')) return;

  this.otp = crypto
    .createHmac('sha256', env.OTP_SECRET)
    .update(this.otp)
    .digest('hex');
});


const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
