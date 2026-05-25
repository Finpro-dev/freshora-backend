-- CreateTable
CREATE TABLE "freeShippingVouchers" (
    "freeShippingVoucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "currentTotalTransactions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "freeShippingVouchers_pkey" PRIMARY KEY ("freeShippingVoucherId")
);

-- CreateIndex
CREATE UNIQUE INDEX "freeShippingVouchers_transactionId_key" ON "freeShippingVouchers"("transactionId");

-- AddForeignKey
ALTER TABLE "freeShippingVouchers" ADD CONSTRAINT "freeShippingVouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freeShippingVouchers" ADD CONSTRAINT "freeShippingVouchers_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE SET NULL ON UPDATE CASCADE;
