import jwt, { TokenExpiredError } from "jsonwebtoken";
import crypto from "crypto";
import { TokenPayload } from "../types/token.type";
import { AUTH_TOKEN } from "../configs/dotenv.config";
import { HASH_SALT } from "../statics/token.static";
import { prisma } from "../configs/prisma.config";
import { AppError } from "./appErrror.util";
import { Response } from "express";
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "../configs/cookie.config";
import { Prisma } from "../../generated/prisma/client";

export const generateTokens = async (
  tokenPayload: TokenPayload,
  tx?: Prisma.TransactionClient,
) => {
  const accessToken = jwt.sign(tokenPayload, AUTH_TOKEN.JWT_ACCESS_SECRET!, {
    expiresIn: "15s",
  });

  const refreshToken = jwt.sign(tokenPayload, AUTH_TOKEN.JWT_REFRESH_SECRET!, {
    expiresIn: "14d",
  });

  // hash refresh token
  const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // store to db
  if (tx) {
    await tx.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        userId: tokenPayload.userId,
        revoked: false,
      },
    });
  } else {
    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        userId: tokenPayload.userId,
        revoked: false,
      },
    });
  }

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (accessToken: string) => {
  return jwt.verify(accessToken, AUTH_TOKEN.JWT_ACCESS_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (refreshToken: string) => {
  try {
    return jwt.verify(
      refreshToken,
      AUTH_TOKEN.JWT_REFRESH_SECRET!,
    ) as TokenPayload;
  } catch (error) {
    if (
      error instanceof TokenExpiredError &&
      error.name === "TokenExpiredError"
    ) {
      throw new AppError(401, "Refresh token expired");
    } else {
      throw new AppError(400, "Invalid refresh token");
    }
  }
};

export const generateRawToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

export const setTokenCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
};

export const clearTokenCookies = (res: Response) => {
  res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
};
