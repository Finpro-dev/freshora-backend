/*
  Warnings:

  - You are about to drop the column `proviceId` on the `addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "addresses" DROP COLUMN "proviceId",
ADD COLUMN     "provinceId" INTEGER NOT NULL DEFAULT 0;
