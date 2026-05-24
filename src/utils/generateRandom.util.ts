import { randomBytes } from "crypto";

export const referralCodeGenerator = (length: number = 8): string => {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += charset[randomValues[i] % charset.length];
  }

  return result;
};

export const generateCouponCode = (): string => {
  return randomBytes(4).toString("hex").toUpperCase();
};
