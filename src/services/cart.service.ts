import { prisma } from "../configs/prisma.config";
import {
  AddToCartInput,
  UpdateCartInput,
  PaginationInput,
} from "../schemas/cart.schema";
import {
  findNearestStore,
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
import { AppError } from "../utils/appError.util";

export const cartServices = {
  getAllCart: async (userId: string, pagination: PaginationInput) => {
    try {
      const cart = await ensureUserCart(userId);
      if (!cart)
        return formatCartResponse("", [], 0, 1, pagination.limit || 10);

      const { page, limit, skip } = calculatePagination(pagination);
      const { cartItems, total } = await fetchPaginatedCartItems(
        cart.cartId,
        skip,
        limit,
      );
      return formatCartResponse(cart.cartId, cartItems, total, page, limit);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  addToCart: async (userId: string, data: AddToCartInput) => {
    try {
      const { productId, storeId, quantity, latitude, longitude } = data;

      let targetStoreId = storeId;
      if (!targetStoreId) {
        if (!latitude || !longitude) {
          throw new AppError(400, "Location is required to find nearest store");
        }
        targetStoreId = await findNearestStore(latitude, longitude);
      }
      
      const cart = await ensureUserCart(userId, targetStoreId);
      if (!cart) throw new AppError(400, "Cart not found");

      if (cart.storeId !== targetStoreId) {
        throw new AppError(
          400,
          "Cannot add items from a different store. Clear your cart first.",
        );
      }

      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.cartId, productId },
      });

      const totalQuantity = (existing?.quantity || 0) + quantity;

      await validateStockAvailability(targetStoreId, productId, totalQuantity);

      return upsertCartItem(cart.cartId, productId, totalQuantity, existing);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  updateCartItem: async (
    userId: string,
    cartItemId: string,
    data: UpdateCartInput,
  ) => {
    try {
      await validateCartItemOwnership(userId, cartItemId);

      const cartItem = await prisma.cartItem.findUniqueOrThrow({
        where: { cartItemId },
      });

      const newQuantity = calculateNewQuantity(
        cartItem.quantity,
        data.quantity,
        data.operation,
      );

      if (
        data.operation === "increase" ||
        (data.operation === "set" && newQuantity > cartItem.quantity)
      ) {
        const cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) throw new AppError(404, "Cart not found");
        await validateStockAvailability(
          cart.storeId,
          cartItem.productId,
          newQuantity,
        );
      }

      return updateOrDeleteItem(cartItemId, newQuantity);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  removeCartItem: async (userId: string, cartItemId: string) => {
    try {
      await validateCartItemOwnership(userId, cartItemId);

      const cartItem = await prisma.cartItem.findUnique({
        where: { cartItemId },
        include: { cart: { include: { cartItems: true } } },
      });

      await prisma.cartItem.delete({ where: { cartItemId } });

      const remainingItems = await prisma.cartItem.count({
        where: { cartId: cartItem!.cart.cartId },
      });
      if (remainingItems === 0) {
        await prisma.cart.delete({ where: { cartId: cartItem!.cart.cartId } });
      }

      return cartItem;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getCartCount: async (userId: string) => {
    try {
      const cart = await ensureUserCart(userId);
      if (!cart) return { totalQuantity: 0 };

      const cartItems = await prisma.cartItem.findMany({
        where: { cartId: cart.cartId },
      });

      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      return { totalQuantity };
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
