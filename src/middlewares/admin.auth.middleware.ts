import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { AppError } from "../utils/appErrror.util";

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        403,
        "Forbidden: You don't have permission to access this resource",
      );
    }

    next();
  };
};
