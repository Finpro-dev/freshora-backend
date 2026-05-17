import { Prisma } from "../../generated/prisma/client";
import { AppError } from "./appErrror.util";

export const handlePrismaError = (error: any): never => {
  console.log("Error --> ", error); // FIXME
  if (error instanceof AppError) throw error;

  // Known Database Request Errors (Codes Pxxxx)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const target =
          (error.meta?.target as string[])?.join(", ") || "this field";
        throw new AppError(
          409,
          `Unique constraint failed: The ${target} is already in use.`,
        );
      }

      case "P2025":
        throw new AppError(
          404,
          "Record not found: The requested resource does not exist.",
        );

      case "P2003":
        throw new AppError(
          400,
          "Foreign key constraint failed: This data is linked to other existing records.",
        );

      case "P2000":
        throw new AppError(
          400,
          "Value too long: The provided input exceeds the column limit.",
        );

      case "P2011":
        throw new AppError(
          400,
          "Constraint violation: A required field cannot be null.",
        );

      default:
        throw new AppError(
          500,
          `Database Exception: Internal error code ${error.code}`,
        );
    }
  }

  // Schema Validation Errors (Triggered before hitting the DB)
  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new AppError(
      400,
      "Invalid data structure: Please check your input fields and types.",
    );
  }

  // Connection & Initialization Errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new AppError(
      503,
      "Database connection failed: The server is currently unable to reach the data source.",
    );
  }

  // Generic Fallback
  throw new AppError(
    500,
    error.message || "Internal Server Error: An unexpected error occurred.",
  );
};
