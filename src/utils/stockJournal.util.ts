import { ActivityType, Prisma } from "../../generated/prisma/client";

// Records a stock journal entry for a given stock and transaction.
export const createStockJournal = (
  stockId: string,
  quantityChange: number,
  type: ActivityType,
  tx: Prisma.TransactionClient,
  transactionId?: string,
  mutationId?: string,
) =>
  tx.stockJournal.create({
    data: {
      stockId,
      quantityChange,
      type,
      transactionId,
      mutationId,
    },
  });