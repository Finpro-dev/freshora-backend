import { CORS_CREDENTIALS } from "./dotenv.config";

const buildAllowedOrigins = (): string[] => {
  const rawOrigins = [
    CORS_CREDENTIALS.FRONTEND_URL,
    CORS_CREDENTIALS.WHITE_LIST_1,
  ];

  // Filter out undefined, null, empty strings
  const cleanOrigins = rawOrigins.filter(
    (origin): origin is string =>
      typeof origin === "string" && origin.trim().length > 0,
  );

  if (process.env.NODE_ENV !== "production") {
    cleanOrigins.push("http://localhost:3000");
  }

  return cleanOrigins;
};

const allowedOrigins = buildAllowedOrigins();

export const CORS_CONFIG = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked: ${origin}`);
      callback(new Error(`CORS policy: Origin "${origin}" is not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
};
