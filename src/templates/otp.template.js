export const emailVerificationOtpTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Verify Your Email Address</h2>
    <p>Use the OTP below to verify your email:</p>
    <h1>${otp}</h1>
    <p>This OTP is valid for <b>10 minutes</b>.</p>
    <p>If you did not create an account, ignore this email.</p>
  </div>
`;


export const loginVerificationOtpTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif;">
    <h2>Login Verification Required</h2>
    <p>We detected a login attempt after a long time or from a new device.</p>
    <p>Please use the OTP below to continue:</p>
    <h1>${otp}</h1>
    <p>This OTP expires in <b>10 minutes</b>.</p>
    <p>If this wasn’t you, secure your account immediately.</p>
  </div>
`;

