import { sendEmail } from "../utils/mailer.js";

export const sendOtpEmail = async ({
  to,
  otp,
  title,
  description
}) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;">
        
        <div style="background:#2563eb;color:#ffffff;padding:20px;text-align:center;">
          <h2 style="margin:0;">${title}</h2>
        </div>

        <div style="padding:24px;color:#111827;line-height:1.6;">
          <p>${description}</p>

          <div style="
            margin:24px 0;
            padding:16px;
            background:#f9fafb;
            border-left:4px solid #2563eb;
            text-align:center;
          ">
            <p style="margin:0 0 8px;">Your One-Time Password</p>
            <h1 style="margin:0;letter-spacing:4px;">${otp}</h1>
          </div>

          <p>This OTP is valid for <b>10 minutes</b>.</p>
          <p>If you did not request this, you can safely ignore this email.</p>

          <p style="margin-top:24px;">
            — Team DoubtNix
          </p>
        </div>

        <div style="background:#f9fafb;padding:16px;text-align:center;font-size:13px;color:#6b7280;">
          © 2025 DoubtNix. All rights reserved.
        </div>

      </div>
    </body>
  </html>
  `;

  const text = `
${title}

${description}

OTP: ${otp}

This OTP is valid for 10 minutes.
If you did not request this, ignore this email.

— Team DoubtNix
`;

  await sendEmail({
    to,
    subject: title,
    html,
    text,
  });
};
