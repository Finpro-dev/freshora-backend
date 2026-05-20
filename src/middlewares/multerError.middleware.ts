// MULTER MIDDLEWARE FOR UPLOAD MANY

import { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/appErrror.util";
import { MAX_PRODUCT_UPLOAD_IMG } from "../statics/multer.static";

export const multerErrorMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  console.log("ERR", err);
  if (err instanceof MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
    throw new AppError(
      400,
      `Maximum upload is ${MAX_PRODUCT_UPLOAD_IMG} file only`,
    );
  } else if (err) {
    throw new AppError(400, `There is an issue during uploading`);
  } else {
    next();
  }
};
