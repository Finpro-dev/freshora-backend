import { NODEMAILER_CREDENTIALS } from "../configs/dotenv.config";
import { transporter } from "../configs/nodemailer.config";
import { emailTestingTemplate } from "../templates/emailTesting.template";
import { AppError } from "../utils/appError.util";
import { uploadMany } from "../utils/cloudinaryUploader.util";

export const testingService = {
  emailTesting: async () => {
    try {
      const template = emailTestingTemplate();

      await transporter.sendMail({
        from: `Freshora<${NODEMAILER_CREDENTIALS.EMAIL_USER}>`,
        to: "gungpra2021@gmail.com",
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      console.log(error);
      throw new AppError(400, `There is a problem during sending the email`);
    }
  },

  uploadTesting: async (uploadedFiles: Express.Multer.File[]) => {
    const urls = await uploadMany(uploadedFiles, "upload-multiple-testing");
    return urls;
  },
};
