import { NODEMAILER_CREDENTIALS } from "../configs/dotenv.config";
import { transporter } from "../configs/nodemailer.config";
import { emailVerificationTemplate } from "../templates/emailVerification.template";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const emailService = {
  sendVerificationEmail: async (
    fullName: string,
    email: string,
    token: string,
  ) => {
    try {
      const template = emailVerificationTemplate(fullName, token);

      await transporter.sendMail({
        from: `Freshora<${NODEMAILER_CREDENTIALS.EMAIL_USER}>`,
        to: email,
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
