-- DropForeignKey
ALTER TABLE "discounts" DROP CONSTRAINT "discounts_productId_fkey";

-- AlterTable
ALTER TABLE "discounts" ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE SET NULL ON UPDATE CASCADE;
