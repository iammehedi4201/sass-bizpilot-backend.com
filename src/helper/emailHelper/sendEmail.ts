import { sendEmailWithResend } from "@/config/emailConfig";

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions) => {
  await sendEmailWithResend(options.to, options.subject, options.html);
};
