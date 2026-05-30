import { Request, Response } from "express";
// import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { storeService } from "../services/store.service";
import { CreateStoreInput } from "../schemas/createStore.schema";
import { EditStoreInput } from "../schemas/editStore.schema";

export const storeController = {
  createStore: catchAsync(async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    const createdStore = await storeService.createStore(
      req.body as CreateStoreInput,
      file,
    );

    res.status(201).json({
      status: "success",
      message: "Store successfully created",
      data: createdStore,
    });
  }),

  getAllStore: catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search as string;

    const data = await storeService.getAllStore({ page, limit, search });
    res.status(200).json({
      status: "success",
      message: "Store data successfully retrieved",
      data,
    });
  }),

  getStoreDetails: catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    const data = await storeService.getStoreDetails(storeId);

    res.status(200).json({
      status: "success",
      message: "Store details successfully retrieved",
      data,
    });
  }),

  deleteStore: catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    await storeService.deleteStore(storeId);

    res.status(200).json({
      status: "success",
      message: "Store deleted successfully retrieved",
    });
  }),

  editStore: catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    const file = req.file as Express.Multer.File;
    const updatedStore = await storeService.editStore(storeId, file, req.body);

    res.status(200).json({
      status: "success",
      message: "Store updated successfully",
      data: updatedStore,
    });
  }),

  assignStoreAdmin: catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    const userId = req.body.userId as string;

    await storeService.assignAdminStore(userId, storeId);

    res.status(200).json({
      status: "success",
      message: "Admin store is assigned successfully",
    });
  }),
};
