import { CORS_CREDENTIALS } from "./dotenv.config";

const allowedOrigins = [
  CORS_CREDENTIALS.FRONTEND_URL,
  CORS_CREDENTIALS.WHITE_LIST_1,
];

export const CORS_CONFIG = {
  origin: (origin: any, callback: Function) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
};
