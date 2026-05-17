import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { DATABASE_CREDENTIALS } from "./dotenv.config";

const connectionString = `${DATABASE_CREDENTIALS.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
