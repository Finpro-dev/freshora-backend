-- CreateEnum
CREATE TYPE "DiscountValueType" AS ENUM ('PERCENTAGE', 'NOMINAL');

-- AlterTable
ALTER TABLE "discounts" ADD COLUMN     "maxDiscount" DECIMAL(10,2),
ADD COLUMN     "valueType" "DiscountValueType" NOT NULL DEFAULT 'NOMINAL';
