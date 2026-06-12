import { NextFunction, Request, Response } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { AppError } from "../utils/appError.util";
import { verifyAccessToken } from "../utils/token.util";
import { Role } from "../../generated/prisma/enums";
import { TokenPayload } from "../types/token.type";

declare global {
  namespace Express {
    interface User extends TokenPayload {}
    // interface Request {
    //   user?: TokenPayload;
    // }
  }
}

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;

  try {
    if (!accessToken) {
      throw new AppError(401, "Unauthenticated action");
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
      throw new AppError(401, "Access token expired");
    } else {
      throw new AppError(400, "Invalid access Token");
    }
  }
};

export const authorization =
  (...allowedRoles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user?.role as Role))
      throw new AppError(403, "Unauthorized action, you are not allowed");

    next();
  };
