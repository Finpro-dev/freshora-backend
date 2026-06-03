import { prisma } from "../configs/prisma.config";
import { AppError } from "./appErrror.util";

export const ensureUserCart = async (userId: string, storeId?: string) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart && storeId) {
    cart = await prisma.cart.create({
      data: { userId, storeId },
    });
  } else {
    return null;
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
          include: { productPhotos: { take: 1, select: { photoUrl: true } } },
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

export const calculatePagination = (pagination: any) => {
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  return { page, limit, skip: (page - 1) * limit };
};

export const formatCartResponse = (
  cartId: string,
  cartItems: any[],
  total: number,
  page: number,
  limit: number,
) => {
  const totalPages = Math.ceil(total / limit);
  return {
    cartId,
    cartItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
    },
  };
};

export const upsertCartItem = async (
  cartId: string,
  productId: string,
  quantity: number,
  existing: any,
) => {
  return existing
    ? await prisma.cartItem.update({
        where: { cartItemId: existing.cartItemId },
        data: { quantity },
      })
    : await prisma.cartItem.create({
        data: { cartId, productId, quantity },
      });
};

export const updateOrDeleteItem = async (
  cartItemId: string,
  newQuantity: number,
) => {
  return newQuantity <= 0
    ? await prisma.cartItem.delete({ where: { cartItemId } })
    : await prisma.cartItem.update({
        where: { cartItemId },
        data: { quantity: newQuantity },
      });
};
