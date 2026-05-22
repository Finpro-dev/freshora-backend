import { CookieOptions } from "express";
import { SERVER_CREDENTIALS } from "./dotenv.config";

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: SERVER_CREDENTIALS.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
  path: "/",
};

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: SERVER_CREDENTIALS.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 14 * 24 * 60 * 60 * 1000,
  path: "/",
};
