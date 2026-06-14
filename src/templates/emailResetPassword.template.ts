import { CORS_CREDENTIALS } from "../configs/dotenv.config";

export const resetPasswordTemplate = (name: string, token: string) => {
  return {
    subject: "Reset Your Password - Freshora",
    html: `
  <div style="font-family: Arial, sans-serif; max-width: 450px; margin: auto; background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-radius: 16px;">
    <!-- Header -->
    <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-bottom: 16px;">Reset your password</h2>
    
    <!-- Body Text -->
    <p style="color: #374151; font-size: 14px; line-height: 24px; margin-bottom: 24px;">
      Hi <strong>${name}</strong>,<br>
      We received a request to reset the password associated with your <span style="color: #10b981; font-weight: 600;">Freshora</span> account. Please click the button below to choose a new, secure password.
    </p>

    <!-- Call to Action Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${CORS_CREDENTIALS.FRONTEND_URL}/reset-password?token=${token}" target="_blank" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);">
        Reset Password
      </a>
    </div>

    <!-- Expiration Note -->
    <p style="color: #6b7280; font-size: 13px; line-height: 20px; background-color: #f9fafb; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 32px;">
      <strong>Note:</strong> This secure link is valid for <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email. Your current password will remain secure.
    </p>

    <!-- Footer -->
    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 16px;">
    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
      Sent by Freshora — Eating healthy everywhere.
    </p>
  </div>
`,
  };
};
