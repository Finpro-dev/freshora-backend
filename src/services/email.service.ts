import { NODEMAILER_CREDENTIALS } from "../configs/dotenv.config";
import { transporter } from "../configs/nodemailer.config";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const emailService = {
  sendEmailWithToken: async (
    email: string,
    template: Record<string, string>,
  ) => {
    try {
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
