import { prisma } from "../configs/prisma.config";
import { AddToCartInput, UpdateCartInput, PaginationInput } from "../schemas/cart.schema";
import {
  validateStockAvailability,
  validateCartItemOwnership,
  ensureUserCart,
  fetchPaginatedCartItems,
  calculateNewQuantity,
} from "../utils/cart.util";

export const cartServices = {
  getAllCart: async (userId: string, pagination: PaginationInput) => {
    const cart = await ensureUserCart(userId);
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const { cartItems, total } = await fetchPaginatedCartItems(
      cart.cartId,
      skip,
      limit,
    );
    const totalPages = Math.ceil(total / limit);

    return {
      cartId: cart.cartId,
      cartItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
      },
    };
  },

  addToCart: async (userId: string, data: AddToCartInput) => {
    const { productId, quantity } = data;
    const cart = await ensureUserCart(userId);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.cartId, productId },
    });

    const totalQuantity = (existing?.quantity || 0) + quantity;
    await validateStockAvailability(productId, totalQuantity);

    if (existing) {
      return await prisma.cartItem.update({
        where: { cartItemId: existing.cartItemId },
        data: { quantity: totalQuantity },
      });
    }

    return await prisma.cartItem.create({
      data: { cartId: cart.cartId, productId, quantity },
    });
  },

  updateCartItem: async (userId: string, cartItemId: string, data: UpdateCartInput) => {
    const { quantity, operation } = data;
    await validateCartItemOwnership(userId, cartItemId);
    const cartItem = await prisma.cartItem.findUniqueOrThrow({
      where: { cartItemId },
    });

    const newQuantity = calculateNewQuantity(cartItem.quantity, quantity, operation);

    if (operation === "increase" || (operation === "set" && newQuantity > cartItem.quantity)) {
      await validateStockAvailability(cartItem.productId, newQuantity);
    }

    return newQuantity <= 0
      ? await prisma.cartItem.delete({ where: { cartItemId } })
      : await prisma.cartItem.update({
          where: { cartItemId },
          data: { quantity: newQuantity },
        });
  },

  removeCartItem: async (userId: string, cartItemId: string) => {
    await validateCartItemOwnership(userId, cartItemId);

    return await prisma.cartItem.delete({
      where: { cartItemId },
    });
  },
};
