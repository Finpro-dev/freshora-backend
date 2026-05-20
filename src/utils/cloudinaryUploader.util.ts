import { upload } from "../configs/multer.config";
import {
  MAX_FILE_SIZE_PRODUCT_IMG,
  MAX_PRODUCT_UPLOAD_IMG,
} from "../statics/multer.static";
import { AppError } from "./appErrror.util";
import { uploadCloudinary } from "./uploadCloudinary.util";

export const uploadSingle = async (file: any, folder: string) => {
  if (!file) {
    throw new AppError(400, "No file uploaded");
  }

  const url = await uploadCloudinary(file.buffer, folder);

  return url;
};

export const uploadMany = async (
  files: Express.Multer.File[],
  folder: string,
) => {
  if (!files) {
    throw new AppError(400, "No file uploaded");
  }

  files.forEach((file) => {
    if (file.size > MAX_FILE_SIZE_PRODUCT_IMG) {
      throw new AppError(400, `${file.originalname} is more than 1MB`);
    }
  });

  try {
    const uploadFileBuffer = files.map((file) =>
      uploadCloudinary(file.buffer, folder),
    );

    const urls = await Promise.all(uploadFileBuffer);

    return urls;
  } catch {
    throw new AppError(400, "Error during uploding multiple files");
  }
};
