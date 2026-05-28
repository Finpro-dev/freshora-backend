import { prisma } from "../configs/prisma.config";
import { snap } from "../configs/midtrans.config";
import { CreateTransactionInput } from "../schemas/createTransaction.schema";
import { AppError } from "../utils/appErrror.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import {
  findNearestStore,
  calculateSubtotal,
  calculateTotalWeight,
  generateInvoiceNumber,
  validateVoucher,
  validateTotalStock,
  getStoreLocationInfo,
  getAddressLocationInfo,
  calculateProductDiscount,
} from "../utils/transactionHelper.util";
import { rajaOngkirService } from "./rajaOngkir.service";
import { rajaOngkirCouriers } from "../statics/courir.static";
import { FreeShippingVoucher } from "../../generated/prisma/client";

const createOrderItems = (cartItems: any[]) =>
  cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.product.price,
    discountAmount: item.discountAmount || 0,
    subTotalItem: Number(item.product.price) * item.quantity,
  }));

export const transactionService = {
  createOrder: async (userId: string, data: CreateTransactionInput) => {
    try {
      // Fetch data & validate BEFORE transaction
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: { cartItems: { include: { product: true } } },
      });
      if (!cart?.cartItems.length) throw new AppError(400, "Cart is empty");

      const address = await prisma.address.findUnique({
        where: { addressId: data.addressId },
      });

      if (!address) throw new AppError(404, "Address not found");
      if (!address.latitude) {
        throw new AppError(400, "Address needs coordinates");
      }

      // Find nearest store
      const storeId = await findNearestStore(
        address.latitude,
        address.longitude!,
      );

      // Validate total stock across all stores
      await validateTotalStock(cart.cartItems);

      // Get user data
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (!user) throw new AppError(404, "User not found");

      // Calculate subtotal & weight
      const subtotal = calculateSubtotal(cart.cartItems);
      const weight = calculateTotalWeight(cart.cartItems);

      // Get location info
      const originInfo = await getStoreLocationInfo(storeId);
      const destInfo = await getAddressLocationInfo(data.addressId);

      // check shipping voucher
      if (data.freeShippingVoucherId) {
        const freeShippingVoucher = await prisma.freeShippingVoucher.findFirst({
          where: {
            freeShippingVoucherId: data.freeShippingVoucherId,
            transactionId: null,
          },
        });

        if (!freeShippingVoucher)
          throw new AppError(400, "Invalid free shipping voucher Id");
      }

      // Call external API BEFORE transaction
      let shippingResult;

      if (!data.freeShippingVoucherId) {
        shippingResult = await rajaOngkirService.calculateShippingCost({
          origin: originInfo.cityId,
          destination: destInfo.cityId,
          weight,
          courier: "jnt",
        });

        while (!shippingResult) {
          const restCouriers = rajaOngkirCouriers.slice(1);

          restCouriers.forEach(async (courier, i) => {
            if (!shippingCost) {
              shippingResult = await rajaOngkirService.calculateShippingCost({
                origin: originInfo.cityId,
                destination: destInfo.cityId,
                weight,
                courier: courier,
              });
            }
          });
        }

        if (!shippingResult)
          throw new AppError(400, "Failed to calculate shipping cost");
      }
      // Validate voucher before transaction
      let discount = 0;
      if (data.referralVoucherId)
        discount = await validateVoucher(data.referralVoucherId, userId);

      // check product discount
      await calculateProductDiscount(cart.cartItems, discount);

      const invoice = generateInvoiceNumber();
      const shippingCost = Number(
        !data.freeShippingVoucherId ? shippingResult?.shippingCost : 0,
      );

      const grandTotal = subtotal + shippingCost - discount;

      // Step 2: Execute transaction with validated data
      return await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            transactionNumber: invoice,
            userId,
            addressId: data.addressId,
            storeId,
            totalAmount: subtotal,
            shippingCost,
            totalDiscount: discount,
            grandTotal,
            transactionStatus: "WAITING_FOR_PAYMENT",
            orderItems: { create: createOrderItems(cart.cartItems) },
          },
        });

        const snapResponse = await snap.createTransaction({
          transaction_details: {
            order_id: transaction.transactionId,
            gross_amount: Math.floor(grandTotal),
          },
          customer_details: {
            first_name: `${user.firstName} ${user.lastName}`,
            email: user.email,
          },
          credit_card: { secure: true },
        } as any);

        await tx.payment.create({
          data: {
            transactionId: transaction.transactionId,
            snapToken: snapResponse.token,
            paymentType: "QRIS",
            paymentStatus: "PENDING",
            expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
          },
        });

        for (const item of cart.cartItems) {
          await tx.stock.update({
            where: {
              storeId_productId: { storeId, productId: item.productId },
            },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        // update free shipping voucher
        if (data.freeShippingVoucherId) {
          await tx.freeShippingVoucher.update({
            where: {
              freeShippingVoucherId: data.freeShippingVoucherId,
            },

            data: {
              transactionId: transaction.transactionId,
            },
          });
        }

        if (data.referralVoucherId) {
          await tx.referralVoucher.update({
            where: { referralVoucherId: data.referralVoucherId },
            data: { transactionId: transaction.transactionId },
          });
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } });

        return {
          transactionId: transaction.transactionId,
          snapToken: snapResponse.token,
        };
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      handlePrismaError(error);
    }
  },
};
