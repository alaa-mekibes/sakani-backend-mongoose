export const getBaseTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 24px 0; background-color:#f5f5f5;">
    <tr>
      <td align="center">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:24px; text-align:center; border-bottom:1px solid #e5e7eb;">
            <img src="https://res.cloudinary.com/dttzb3fyd/image/upload/v1775254301/sakani-logo-nobg_rfemyr.png" 
                   alt="Sakani" 
                   style="height:60px; max-width:100%; display:block; margin:0 auto 8px;">
              
              <p style="margin:0; font-size:12px; color:#6b7280;">
                Real estate platform in Algeria
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 24px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px; border-top:1px solid #e5e7eb; text-align:center;">
              <p style="margin:0 0 6px 0; font-size:12px; color:#6b7280;">
                © ${new Date().getFullYear()} Sakani. All rights reserved.
              </p>
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

export const getVerificationContent = (code: string) => `
  <h2 style="margin:0 0 12px 0; font-size:20px; color:#111827;">
    Email Verification
  </h2>

  <p style="margin:0 0 20px 0; font-size:14px; color:#4b5563; line-height:1.5;">
    Please use the verification code below to complete your registration.
  </p>

  <div style="margin:24px 0; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; text-align:center;">
    <span style="font-size:28px; letter-spacing:6px; font-weight:600; color:#111827; font-family:monospace;">
      ${code}
    </span>
  </div>

  <p style="margin:0; font-size:13px; color:#6b7280;">
    This code will expire in 10 minutes.
  </p>
`;

export const getResetPasswordContent = (code: string) => `
  <h2 style="margin:0 0 12px 0; font-size:20px; color:#111827;">
    Password Reset
  </h2>

  <p style="margin:0 0 20px 0; font-size:14px; color:#4b5563; line-height:1.5;">
    A request was received to reset your password. Use the code below to proceed.
  </p>

  <div style="margin:24px 0; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; text-align:center;">
    <span style="font-size:28px; letter-spacing:6px; font-weight:600; color:#111827; font-family:monospace;">
      ${code}
    </span>
  </div>

  <p style="margin:0; font-size:13px; color:#6b7280;">
    If you did not request this, you can ignore this email.
  </p>
`;

export const getWelcomeContent = (name: string) => `
  <h2 style="margin:0 0 12px 0; font-size:20px; color:#111827;">
    Welcome, ${name}
  </h2>

  <p style="margin:0 0 24px 0; font-size:14px; color:#4b5563; line-height:1.5;">
    Your account has been successfully created. You can now explore available properties across Algeria.
  </p>

  <div style="margin:24px 0;">
    <a href="https://sakanidz.netlify.app/properties" 
       style="display:inline-block; padding:12px 20px; font-size:14px; color:#ffffff; background-color:#111827; text-decoration:none; border-radius:4px;">
      Browse Properties
    </a>
  </div>

  <p style="margin:0; font-size:13px; color:#6b7280;">
    For assistance, contact <a href="mailto:techtimear360@gmail.com">techtimear360@gmail.com</a>
  </p>
`;