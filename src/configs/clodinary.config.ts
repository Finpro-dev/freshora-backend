import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_CREDENTIALS } from "./dotenv.config";

cloudinary.config({
  cloud_name: CLOUDINARY_CREDENTIALS.CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_CREDENTIALS.CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_CREDENTIALS.CLOUDINARY_API_SECRET,
});

export default cloudinary;
