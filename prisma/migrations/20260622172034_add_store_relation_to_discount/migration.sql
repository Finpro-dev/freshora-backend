-- AlterTable
ALTER TABLE "discounts" ADD COLUMN     "storeId" TEXT;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("storeId") ON DELETE SET NULL ON UPDATE CASCADE;
