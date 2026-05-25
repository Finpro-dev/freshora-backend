import { prisma } from "../configs/prisma.config";
import { AddToCartInput, UpdateCartInput, PaginationInput } from "../schemas/cart.schema";
import {
  validateStockAvailability,
  validateCartItemOwnership,
  ensureUserCart,
  fetchPaginatedCartItems,
  calculateNewQuantity,
  calculatePagination,
  formatCartResponse,
  upsertCartItem,
  updateOrDeleteItem,
} from "../utils/cart.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const cartServices = {
  getAllCart: async (userId: string, pagination: PaginationInput) => {
    try {
      const cart = await ensureUserCart(userId);
      const { page, limit, skip } = calculatePagination(pagination);
      const { cartItems, total } = await fetchPaginatedCartItems(cart.cartId, skip, limit);
      return formatCartResponse(cart.cartId, cartItems, total, page, limit);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  addToCart: async (userId: string, data: AddToCartInput) => {
    try {
      const { productId, quantity } = data;
      const cart = await ensureUserCart(userId);
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.cartId, productId },
      });
      const totalQuantity = (existing?.quantity || 0) + quantity;
      await validateStockAvailability(productId, totalQuantity);
      return await upsertCartItem(cart.cartId, productId, totalQuantity, existing);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  updateCartItem: async (userId: string, cartItemId: string, data: UpdateCartInput) => {
    try {
      const { quantity, operation } = data;
      await validateCartItemOwnership(userId, cartItemId);
      const cartItem = await prisma.cartItem.findUniqueOrThrow({ where: { cartItemId } });
      const newQuantity = calculateNewQuantity(cartItem.quantity, quantity, operation);
      if (operation === "increase" || (operation === "set" && newQuantity > cartItem.quantity)) {
        await validateStockAvailability(cartItem.productId, newQuantity);
      }
      return await updateOrDeleteItem(cartItemId, newQuantity);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  removeCartItem: async (userId: string, cartItemId: string) => {
    try {
      await validateCartItemOwnership(userId, cartItemId);
      return await prisma.cartItem.delete({ where: { cartItemId } });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getCartCount: async (userId: string) => {
    try {
      const cart = await ensureUserCart(userId);
      const cartItems = await prisma.cartItem.findMany({ where: { cartId: cart.cartId } });
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      return { totalQuantity };
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
