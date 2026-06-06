import { Prisma } from "../../generated/prisma/client";
import { AppError } from "./appErrror.util";

// Checks and decrements stock inside a Prisma transaction
export const decrementStock = async (
  storeId: string,
  productId: string,
  quantity: number,
  transactionId: string,
  tx: Prisma.TransactionClient,
) => {
  const stock = await tx.stock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });

  if (!stock || stock.quantity < quantity) {
    const available = stock?.quantity ?? 0;
    throw new AppError(
      400,
      `Insufficient stock for product ${productId}: requested ${quantity}, available ${available}`,
    );
  }

  await tx.stock.update({
    where: { storeId_productId: { storeId, productId } },
    data: { quantity: { decrement: quantity } },
  });
};