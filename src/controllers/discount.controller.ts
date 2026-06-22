// import { catchAsync } from "../utils/catchAsync.util";
// import { Request, Response } from "express";
// import { discountServices } from "../services/discount.service";
// import { CreateDiscountInput } from "../schemas/discount.schema";
// import { GetDiscountInput } from "../schemas/discount.schema";

// export const discountController = {
//   getDiscount: catchAsync(async (req: Request, res: Response) => {
//     const { page, limit, type, status } =
//       req.query as unknown as GetDiscountInput;
//     const discount = await discountServices.getDiscount({
//       page,
//       limit,
//       type,
//       status,
//     });
//     res.status(200).json({
//       status: "success",
//       data: discount,
//     });
//   }),
//   createDiscount: catchAsync(
//     async (req: Request<{}, {}, CreateDiscountInput>, res: Response) => {
//       const newDiscount = await discountServices.createDiscount(req.body);

//       res.status(201).json({
//         status: "success",
//         message: "Discount created successfully",
//         data: newDiscount,
//       });
//     },
//   ),

//   deleteDiscount: catchAsync(async (req: Request, res: Response) => {
//     const { discountId } = req.params as { discountId: string };
//     await discountServices.deleteDiscount(discountId);
//     res.status(200).json({
//       status: "success",
//       message: "Discount deleted successfully",
//     });
//   }),
// };
