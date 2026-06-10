// MULTER MIDDLEWARE FOR UPLOAD MANY

import { ErrorRequestHandler } from "express";
import { MulterError } from "multer";
import { AppError } from "../utils/appError.util";
import { MAX_PRODUCT_UPLOAD_IMG } from "../statics/multer.static";

export const multerErrorMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next,
) => {
  if (err instanceof MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
    throw new AppError(
      400,
      `Maximum upload is ${MAX_PRODUCT_UPLOAD_IMG} file only`,
    );
  } else if (err instanceof AppError) {
    throw new AppError(err.statusCode, err.message);
  } else if (err) {
    throw new AppError(400, `Upload issue: ${err.message}`);
  } else {
    next();
  }
};
