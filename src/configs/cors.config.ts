import { CORS_CREDENTIALS } from "./dotenv.config";

export const CORS_CONFIG = {
  origin: CORS_CREDENTIALS.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
