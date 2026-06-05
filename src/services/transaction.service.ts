import { snap } from "../configs/midtrans.config";
import { prisma } from "../configs/prisma.config";
import { CreateTransactionInput } from "../schemas/createTransaction.schema";
import { rajaOngkirCouriers } from "../statics/courir.static";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import {
  calculateProductDiscount,
  calculateSubtotal,
  calculateTotalWeight,
  findNearestStore,
  generateInvoiceNumber,
  getAddressLocationInfo,
  getStoreLocationInfo,
  validateTotalStock,
  validateVoucher,
} from "../utils/transactionHelper.util";
import { rajaOngkirService } from "./rajaOngkir.service";

const createOrderItems = (cartItems: any[]) =>
  cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.product.price,
    discountAmount: item.discountAmount || 0,
    subTotalItem: item.subtotal || Number(item.product.price) * item.quantity,
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

      const storeId = cart.storeId;

      const address = await prisma.address.findUnique({
        where: { addressId: data.addressId },
      });

      if (!address) throw new AppError(404, "Address not found");

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
            userId,
            transactionId: null,
          },
        });

        if (!freeShippingVoucher)
          throw new AppError(400, "Invalid free shipping voucher Id");
      }

      // Call external API BEFORE transaction
      let shippingResult = 0;

      if (!data.freeShippingVoucherId) {
        shippingResult = await rajaOngkirService.calculateShippingCost({
          origin: originInfo.cityId,
          destination: destInfo.cityId,
          weight,
          courier: "jnt",
        });

        while (!shippingResult) {
          const restCouriers = rajaOngkirCouriers.slice(1);

          for (const courier of restCouriers) {
            if (!shippingResult) {
              shippingResult = await rajaOngkirService.calculateShippingCost({
                origin: originInfo.cityId,
                destination: destInfo.cityId,
                weight,
                courier: courier,
              });
            }
          }
        }

        if (!shippingResult)
          throw new AppError(400, "Failed to calculate shipping cost");
      }

      let discount = {
        productItemDiscountAmmount: 0,
        referralVoucherDiscount: 0,
      };

      const invoice = generateInvoiceNumber();
      const shippingCost = Number(
        !data.freeShippingVoucherId ? shippingResult : 0,
      );

      // check product discount
      await calculateProductDiscount(cart.cartItems, discount);

      let grandTotal = subtotal - discount.productItemDiscountAmmount;

      // check referral voucher
      if (data.referralVoucherId)
        await validateVoucher(
          data.referralVoucherId,
          userId,
          grandTotal,
          discount,
        );

      grandTotal = grandTotal + shippingCost - discount.referralVoucherDiscount;

      const totalDiscountAmount =
        discount.productItemDiscountAmmount + discount.referralVoucherDiscount;

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
            totalDiscount: totalDiscountAmount,
            grandTotal,
            transactionStatus: "WAITING_FOR_PAYMENT",
            orderItems: { create: createOrderItems(cart.cartItems) },
          },
        });

        const snapResponse = await snap.createTransaction({
          transaction_details: {
            order_id: transaction.transactionNumber,
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
      handlePrismaError(error);
    }
  },
};
