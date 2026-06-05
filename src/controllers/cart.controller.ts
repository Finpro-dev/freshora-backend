import { Request, Response } from "express";
import {
  AddToCartInput,
  UpdateCartInput,
} from "../schemas/cart.schema";
import { cartServices } from "../services/cart.service";
import { catchAsync } from "../utils/catchAsync.util";

export const cartController = {
  getAllCart: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const cart = await cartServices.getAllCart(userId, { page, limit });

    res.status(200).json({
      status: "success",
      message: "Cart retrieved successfully",
      data: cart,
    });
  }),

  addToCart: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const data = req.body as AddToCartInput;

    const cartItem = await cartServices.addToCart(userId, data);

    res.status(201).json({
      status: "success",
      message: "Item added to cart successfully",
      data: cartItem,
    });
  }),

  updateCartItem: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { cartItemId } = req.params as { cartItemId: string };
    const data = req.body as UpdateCartInput;

    const result = await cartServices.updateCartItem(userId, cartItemId, data);

    res.status(200).json({
      status: "success",
      message: "Cart item updated successfully",
      data: result,
    });
  }),

  removeCartItem: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { cartItemId } = req.params as { cartItemId: string };

    await cartServices.removeCartItem(userId, cartItemId);

    res.status(200).json({
      status: "success",
      message: "Cart item removed successfully",
    });
  }),

  getCartCount: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result = await cartServices.getCartCount(userId);

    res.status(200).json({
      status: "success",
      message: "Cart count retrieved successfully",
      data: result,
    });
  }),
};