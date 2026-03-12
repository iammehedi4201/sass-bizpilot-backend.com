import { Resend } from "resend";
import { ENV } from "./envs";

export async function sendEmailWithResend(
  recipients: string | string[],
  subject: string,
  emailBody: string,
) {
  const resend = new Resend(ENV.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: ENV.RESEND_SENDER || "info@bizpilot.xyz",
    to: Array.isArray(recipients) ? recipients : [recipients],
    subject,
    html: emailBody,
  });

  if (error) {
    return console.error({ error });
  }

  return data;
}
