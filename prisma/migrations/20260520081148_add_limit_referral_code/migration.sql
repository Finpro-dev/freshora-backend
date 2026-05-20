/*
  Warnings:

  - You are about to alter the column `myReferralCode` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "myReferralCode" SET DATA TYPE VARCHAR(8);
