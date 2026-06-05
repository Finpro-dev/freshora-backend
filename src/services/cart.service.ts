import { prisma } from "../configs/prisma.config";
import {
  AddToCartInput,
  UpdateCartInput,
  PaginationInput,
} from "../schemas/cart.schema";
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
import { AppError } from "../utils/appError.util";

export const cartServices = {
  // Retrieves the user's cart with paginated items.
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

  // Adds a product to the user's cart and merges quantity if the product already exists.
  addToCart: async (userId: string, data: AddToCartInput) => {
    try {
      const { productId, storeId, quantity } = data;

      // Get or create cart for this user
      const cart = await ensureUserCart(userId, storeId);
      if (!cart) throw new AppError(400, "Cart not found");

      // Enforce single-store cart: block cross-store additions
      if (cart.storeId !== storeId) {
        throw new AppError(
          400,
          "Cannot add items from a different store. Clear your cart first.",
        );
      }

      // Check for existing cart item to merge quantities
      const existing = await prisma.cartItem.findFirst({
        where: { cartId: cart.cartId, productId },
      });

      const totalQuantity = (existing?.quantity || 0) + quantity;

      // Validate stock at the cart's store
      await validateStockAvailability(storeId, productId, totalQuantity);

      return upsertCartItem(cart.cartId, productId, totalQuantity, existing);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  // Updates the quantity of a cart item.
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

      // Only check stock when increasing quantity
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

  // Removes a single item from the user's cart.
  removeCartItem: async (userId: string, cartItemId: string) => {
    try {
      await validateCartItemOwnership(userId, cartItemId);
      return prisma.cartItem.delete({ where: { cartItemId } });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  // Total quantity of all items in the user's cart.
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
