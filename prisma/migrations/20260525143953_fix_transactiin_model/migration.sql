/*
  Warnings:

  - You are about to drop the column `storeOrderId` on the `orderItems` table. All the data in the column will be lost.
  - You are about to drop the `storeOrders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `transactionId` to the `orderItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountId` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCost` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionStatus` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orderItems" DROP CONSTRAINT "orderItems_storeOrderId_fkey";

-- DropForeignKey
ALTER TABLE "storeOrders" DROP CONSTRAINT "storeOrders_discountId_fkey";

-- DropForeignKey
ALTER TABLE "storeOrders" DROP CONSTRAINT "storeOrders_storeId_fkey";

-- DropForeignKey
ALTER TABLE "storeOrders" DROP CONSTRAINT "storeOrders_transactionId_fkey";

-- AlterTable
ALTER TABLE "orderItems" DROP COLUMN "storeOrderId",
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "discountId" TEXT NOT NULL,
ADD COLUMN     "shippingCost" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "storeId" TEXT NOT NULL,
ADD COLUMN     "transactionStatus" "TransactionStatus" NOT NULL;

-- DropTable
DROP TABLE "storeOrders";

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("discountId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;
