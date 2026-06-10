/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId]` on the table `cartItems` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cartItems_cartId_productId_key" ON "cartItems"("cartId", "productId");
