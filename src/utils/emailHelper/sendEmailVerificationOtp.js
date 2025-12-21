import { emailVerificationOtpTemplate } from "../../templates/otp.template.js";
import { sendEmail } from "../mailer.js";

export const sendEmailVerificationOtp = async (email, otp) => {
  const html = emailVerificationOtpTemplate(otp);

  await sendEmail(
    email,
    "Verify your email address",
    html
  );
};
