import { Request, Response } from "express";
import {
  AddToCartInput,
  UpdateCartInput,
  PaginationInput,
} from "../schemas/cart.schema";
import { cartServices } from "../services/cart.service";
import { catchAsync } from "../utils/catchAsync.util";
// import { AuthenticatedRequest } from "../types/appRequest.type";

export const cartController = {
  getAllCart: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const pagination: PaginationInput = {
      page: (req.query.page as unknown as number) || 1,
      limit: (req.query.limit as unknown as number) || 10,
    };
    const storeId = req.body.storeId as string;
    const cart = await cartServices.getAllCart(userId, storeId, pagination);

    res.status(200).json({
      status: "success",
      message: "Cart retrieved successfully",
      data: cart,
    });
  }),

  addToCart: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const cartItem = await cartServices.addToCart(
      userId,
      req.body as AddToCartInput,
    );

    res.status(201).json({
      status: "success",
      message: "Item added to cart successfully",
      data: cartItem,
    });
  }),

  updateCartItem: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { cartItemId } = req.params as { cartItemId: string };
    const result = await cartServices.updateCartItem(
      userId,
      cartItemId,
      req.body as UpdateCartInput,
    );

    res.status(200).json({
      status: "success",
      message: "Cart item updated successfully",
      data: result,
    });
  }),

  removeCartItem: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { cartItemId } = req.params as { cartItemId: string };
    await cartServices.removeCartItem(userId, cartItemId);

    res.status(200).json({
      status: "success",
      message: "Cart item removed successfully",
    });
  }),

  getCartCount: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const result = await cartServices.getCartCount(userId);

    res.status(200).json({
      status: "success",
      message: "Cart count retrieved successfully",
      data: result,
    });
  }),
};
