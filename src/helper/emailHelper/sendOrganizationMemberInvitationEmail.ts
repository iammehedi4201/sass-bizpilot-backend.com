import { sendEmail } from "./sendEmail";

export const getOrganizationMemberInvitationEmailTemplate = (
  link: string,
) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Organization Invitation</title>
  </head>
  <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f4f7fa;">
    <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f4f7fa;">
      <tr>
        <td align="center" style="padding:40px 20px;">
          <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding:40px 40px 30px;text-align:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px 12px 0 0;">
                <h2 style="margin:0;color:#ffffff;font-size:24px;">You're Invited!</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#1a1a1a;text-align:center;">Organization Invitation</h1>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4a5568;text-align:center;">
                  You have been invited to join an organization on BizPilot. Click the button below to register and get started.
                </p>
                <table role="presentation" style="width:100%;margin:32px 0;">
                  <tr>
                    <td align="center">
                      <a href="${link}" style="display:inline-block;padding:16px 48px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;box-shadow:0 4px 12px rgba(102,126,234,0.4);">
                        Register Now
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 40px;">
                <div style="background-color:#fff5f5;border-left:4px solid #f56565;padding:16px;border-radius:6px;">
                  <p style="margin:0;font-size:14px;color:#742a2a;line-height:1.5;">
                    <strong>Important:</strong> This invitation link will expire in <strong>30 days</strong>.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;background-color:#f8fafc;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:13px;color:#a0aec0;text-align:center;">
                  &copy; ${new Date().getFullYear()} BizPilot. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export const sendOrganizationMemberInvitationEmail = async (
  email: string,
  link: string,
) => {
  await sendEmail({
    to: email,
    subject: "Organization Invitation - BizPilot",
    html: getOrganizationMemberInvitationEmailTemplate(link),
  });
};
