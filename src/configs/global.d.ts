import { TokenPayload } from "../types/token.type";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
