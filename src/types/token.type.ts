import { Role } from "../../generated/prisma/enums";

export interface TokenPayload {
  userId: string;
  fullName: string;
  role: Role;
  storeId?: string;
}
