import { sendEmail } from "../utils/mailer.js";

export const sendWelcomeEmail = async (user) => {
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Welcome to DoubtNix</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
          font-family: Arial, Helvetica, sans-serif;
          color: #111827;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #2563eb;
          color: #ffffff;
          padding: 24px;
          text-align: center;
        }
        .content {
          padding: 24px;
          line-height: 1.6;
        }
        .features {
          margin: 20px 0;
          padding: 16px;
          background-color: #f9fafb;
          border-left: 4px solid #2563eb;
        }
        .features ul {
          padding-left: 18px;
        }
        .footer {
          padding: 16px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          background-color: #f9fafb;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to DoubtNix</h1>
        </div>

        <div class="content">
          <p>Hi ${user.name},</p>

          <p>
            Your account has been successfully created.
            You can now use DoubtNix to analyze documents and get AI-powered answers instantly.
          </p>

          <div class="features">
            <strong>What you can do:</strong>
            <ul>
              <li>Upload PDF, DOCX, and image files</li>
              <li>Ask questions directly from your documents</li>
              <li>Receive instant AI-generated answers</li>
              <li>Access and manage conversation history</li>
              <li>Use secure authentication and verification</li>
            </ul>
          </div>

          <p>
            You can log in anytime and start using the platform immediately.
            No additional setup is required.
          </p>

          <p>
            If you face any issues, contact our support team.
          </p>

          <p>
            — Team DoubtNix
          </p>
        </div>

        <div class="footer">
          <p>© 2025 DoubtNix. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;

  const text = `
Welcome to DoubtNix

Hi ${user.name},

Your account has been successfully created.

You can now:
- Upload PDF, DOCX, and image files
- Ask questions from your documents
- Get instant AI-powered answers
- Manage your conversation history
- Use secure authentication

You can log in anytime and start using the platform.

© 2025 DoubtNix. All rights reserved.
  `;

  await sendEmail({
    to: user.email,
    subject: "Welcome to DoubtNix",
    html,
    text,
  });
}
