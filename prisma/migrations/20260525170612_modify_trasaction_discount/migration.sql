-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_discountId_fkey";

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "discountId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("discountId") ON DELETE SET NULL ON UPDATE CASCADE;
