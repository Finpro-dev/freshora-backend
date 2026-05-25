/*
  Warnings:

  - The values [WAITING_PAYMENT,WAITING_CONFIRMATION,PAID,CANCELED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CARD,TRANSFER] on the enum `PaymentType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `paymentGatewayId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentProof` on the `payments` table. All the data in the column will be lost.
  - Added the required column `snapToken` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'SETTLEMENT', 'DENIED', 'EXPIRED', 'CANCELLED', 'REFUNDED');
ALTER TABLE "payments" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentType_new" AS ENUM ('GOPAY', 'BANK_TRANSFER', 'CREDIT_CARD', 'SHOPEEPAY', 'OVO', 'DANA', 'QRIS', 'ALFAMART', 'INDOMARET', 'AKULAKU', 'KREDIVO', 'GOOGLE_PAY');
ALTER TABLE "payments" ALTER COLUMN "paymentType" TYPE "PaymentType_new" USING ("paymentType"::text::"PaymentType_new");
ALTER TYPE "PaymentType" RENAME TO "PaymentType_old";
ALTER TYPE "PaymentType_new" RENAME TO "PaymentType";
DROP TYPE "public"."PaymentType_old";
COMMIT;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentGatewayId",
DROP COLUMN "paymentProof",
ADD COLUMN     "snapToken" TEXT NOT NULL;
