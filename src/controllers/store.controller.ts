import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { storeService } from "../services/store.service";
import { CreateStoreInput } from "../schemas/createStore.schema";

export const storeController = {
  createStore: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
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
};
