import { prisma } from "../configs/prisma.config";
import { AppError } from "./appErrror.util";

export const ensureUserCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
};

export const validateStockAvailability = async (
  productId: string,
  requestedQuantity: number,
): Promise<void> => {
  const stock = await prisma.stock.findFirst({
    where: {
      productId,
      quantity: { gte: requestedQuantity },
    },
  });

  if (!stock) {
    throw new AppError(400, "Insufficient stock");
  }
};

export const validateCartItemOwnership = async (
  userId: string,
  cartItemId: string,
): Promise<void> => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { cartItemId },
    include: { cart: true },
  });

  if (!cartItem) {
    throw new AppError(404, "Cart item not found");
  }

  if (cartItem.cart.userId !== userId) {
    throw new AppError(403, "Unauthorized");
  }
};

export const fetchPaginatedCartItems = async (
  cartId: string,
  skip: number,
  limit: number,
) => {
  const [cartItems, total] = await Promise.all([
    prisma.cartItem.findMany({
      where: { cartId },
      skip,
      take: limit,
      include: {
        product: {
          include: {
            productPhotos: {
              take: 1,
              select: { photoUrl: true },
            },
          },
        },
      },
    }),
    prisma.cartItem.count({ where: { cartId } }),
  ]);
  return { cartItems, total };
};

export const calculateNewQuantity = (
  currentQuantity: number,
  requestQuantity: number,
  operation: "set" | "increase" | "decrease",
): number => {
  if (operation === "increase") return currentQuantity + requestQuantity;
  if (operation === "decrease") return currentQuantity - requestQuantity;
  return requestQuantity; // "set"
};
