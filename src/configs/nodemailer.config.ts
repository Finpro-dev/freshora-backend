import nodemailer from "nodemailer";
import { NODEMAILER_CREDENTIALS } from "./dotenv.config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_CREDENTIALS.EMAIL_USER,
    pass: NODEMAILER_CREDENTIALS.GOOGLE_APP_PASSWORD,
  },
});
