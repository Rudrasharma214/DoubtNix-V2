import SibApiV3Sdk from 'sib-api-v3-sdk';
import { env } from '../config/env.js';

export const sendEmail = async (to, subject, text) => {
  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = env.BREVO_API_KEY || "";

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const senderEmail = env.BREVO_FROM_EMAIL || "no-reply@example.com";

    const sendSmtpEmail = {
      sender: { email: senderEmail },
      to: [{ email: to }],
      subject,
      textContent: text,
    };

    const resp = await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    const err = new Error(
      `Failed to send email via Brevo: ${error && error.message ? error.message : error}`
    );
    err.cause = error;
    throw err;
  }
};
