import jwt, { TokenExpiredError } from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { TokenPayload } from "../types/token.type";
import { AUTH_TOKEN } from "../configs/dotenv.config";
import { HASH_SALT } from "../statics/token.static";
import { prisma } from "../configs/prisma.config";
import { AppError } from "./appErrror.util";

export const generateTokens = async (tokenPayload: TokenPayload) => {
  const accessToken = jwt.sign(tokenPayload, AUTH_TOKEN.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(tokenPayload, AUTH_TOKEN.JWT_REFRESH_SECRET!, {
    expiresIn: "14d",
  });

  // hash refresh token
  const hashedRefreshToken = await bcrypt.hash(refreshToken, HASH_SALT);

  // store to db
  await prisma.refreshToken.create({
    data: {
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      userId: tokenPayload.userId,
      revoked: false,
    },
  });

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (accessToken: string) => {
  return jwt.verify(accessToken, AUTH_TOKEN.JWT_ACCESS_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (refreshToken: string) => {
  try {
    return jwt.verify(
      refreshToken,
      AUTH_TOKEN.JWT_ACCESS_SECRET!,
    ) as TokenPayload;
  } catch (error) {
    if (
      error instanceof TokenExpiredError &&
      error.name === "TokenExpiredError"
    ) {
      throw new AppError(401, "Session finished");
    } else {
      throw new AppError(401, "Invalid refresh token");
    }
  }
};

export const generateRawToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};
