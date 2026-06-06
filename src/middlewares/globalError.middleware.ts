import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError.util";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1) check apakah error berasal dari prisma
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      status: "error",
      message: err.message,
    });
  }

  // 2) log error supaya  bisa lihat di terminal,
  // Jika sampai sini, berarti error bukan milik appError
  // Error tak terduga (bug, dll) — jangan expose detail ke user
  console.error("INTERNAL SERVER ERROR:", err);

  return res.status(500).json({
    status: "error",
    message: "There's an issue in the server",
  });
};
