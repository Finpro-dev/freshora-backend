import { Request, Response } from "express";
// import { AuthenticatedRequest } from "../types/appRequest.type";
import { generateTokens, setTokenCookies } from "../utils/token.util";
import { CORS_CREDENTIALS } from "../configs/dotenv.config";

export const handleGoogleAuthSuccess = async (req: Request, res: Response) => {
  try {
    const user = req?.user;

    if (!user)
      return res.redirect(`${CORS_CREDENTIALS.FRONTEND_URL as string}/login`);

    const { accessToken, refreshToken } = await generateTokens(user);
    setTokenCookies(res, accessToken, refreshToken);

    return res.redirect(`${CORS_CREDENTIALS.FRONTEND_URL as string}`);
  } catch (error) {
    return res.redirect(`${CORS_CREDENTIALS.FRONTEND_URL as string}/login`);
  }
};
