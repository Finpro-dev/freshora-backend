/*
  Warnings:

  - Added the required column `revoked` to the `refreshTokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refreshTokens" ADD COLUMN     "revoked" BOOLEAN NOT NULL;
