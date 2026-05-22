import { NextFunction, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { AppError } from "../utils/appErrror.util";
import { verifyAccessToken } from "../utils/token.util";

export const authentication = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;

  try {
    if (!accessToken) {
      throw new AppError(401, "Unauthorized action");
    }

    const decoded = verifyAccessToken(accessToken);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      fullName: decoded.fullName,
    };

    next();
  } catch (error) {
    if (
      error instanceof TokenExpiredError &&
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({ error: "Access token expired" });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

export const authorization =
  (...allowedRoles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(String(req.user?.role)))
      throw new AppError(403, "Unauthorized action, you are not allowed");

    next();
  };
