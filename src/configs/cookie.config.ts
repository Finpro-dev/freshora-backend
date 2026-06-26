import { CookieOptions } from "express";
import { SERVER_CREDENTIALS } from "./dotenv.config";

const isProd = SERVER_CREDENTIALS.NODE_ENV === "production";

export const ACCESS_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 15 * 60 * 1000,
  path: "/",
  ...(isProd && { domain: ".vercel.app" }),
};

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  maxAge: 14 * 24 * 60 * 60 * 1000,
  path: "/",
  ...(isProd && { domain: ".vercel.app" }),
};

export const USER_EMAIL_VERIFY_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 1000 * 24,
  ...(isProd && { domain: ".vercel.app" }),
};
