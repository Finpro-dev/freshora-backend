import { prisma } from "../configs/prisma.config";
import { AppError } from "./appErrror.util";

// Ensures the user's cart exists, creating one if necessary.
export const ensureUserCart = async (userId: string, storeId?: string) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (cart) return cart;

  if (!storeId) return null;

  return prisma.cart.create({ data: { userId, storeId } });
};

// Validates stock at the specified store for a product.
export const validateStockAvailability = async (
  storeId: string,
  productId: string,
  requestedQuantity: number,
): Promise<void> => {
  const stock = await prisma.stock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });

  if (!stock || stock.quantity < requestedQuantity) {
    const msg = !stock
      ? "Product not available at this store"
      : `Only ${stock.quantity} in stock`;
    throw new AppError(400, msg);
  }
};

// Ensures the cart item belongs to user.
export const validateCartItemOwnership = async (
  userId: string,
  cartItemId: string,
): Promise<void> => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { cartItemId },
    include: { cart: true },
  });

  if (!cartItem) throw new AppError(404, "Cart item not found");
  if (cartItem.cart.userId !== userId) throw new AppError(403, "Unauthorized");
};

// Fetches paginated cart items with product photos.
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

// Adjusts quantity based on operation type.
export const calculateNewQuantity = (
  currentQuantity: number,
  requestQuantity: number,
  operation: "set" | "increase" | "decrease",
): number => {
  if (operation === "increase") return currentQuantity + requestQuantity;
  if (operation === "decrease") return currentQuantity - requestQuantity;
  return requestQuantity;
};

// Computes page/skip values for pagination.
export const calculatePagination = (pagination: { page?: number; limit?: number }) => {
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  return { page, limit, skip: (page - 1) * limit };
};

// Formats cart response with pagination metadata.
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
    pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages },
  };
};

// Updates quantity if exists, otherwise creates new.
export const upsertCartItem = async (
  cartId: string,
  productId: string,
  quantity: number,
  existing: any,
) => {
  return existing
    ? prisma.cartItem.update({ where: { cartItemId: existing.cartItemId }, data: { quantity } })
    : prisma.cartItem.create({ data: { cartId, productId, quantity } });
};

// Updates quantity or removes item if quantity drops to zero.
export const updateOrDeleteItem = async (cartItemId: string, newQuantity: number) => {
  return newQuantity <= 0
    ? prisma.cartItem.delete({ where: { cartItemId } })
    : prisma.cartItem.update({ where: { cartItemId }, data: { quantity: newQuantity } });
};
