import { Prisma } from "../../generated/prisma/client";
import { snap } from "../configs/midtrans.config";
import { prisma } from "../configs/prisma.config";
import { CreateTransactionInput } from "../schemas/createTransaction.schema";
import { TDiscount } from "../types/transaction.type";
import { rajaOngkirCouriers } from "../statics/courir.static";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { createStockJournal } from "../utils/stockJournal.util";
import { decrementStock } from "../utils/stock.util";
import {
  calculateProductDiscount,
  calculateSubtotal,
  calculateTotalWeight,
  generateInvoiceNumber,
  getAddressLocationInfo,
  getStoreLocationInfo,
  validateFreeShippingVoucher,
  validateTotalStock,
  validateVoucher,
} from "../utils/transactionHelper.util";
import {
  applyFreeShippingVoucher,
  applyReferralVoucher,
  buildOrderItems,
  calculateShipping,
} from "../utils/transactionOrder.util";

export const transactionService = {
  createOrder: async (userId: string, data: CreateTransactionInput) => {
    try {
      // 1. Fetch cart with items and product discount data
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          cartItems: {
            include: { product: { include: { discounts: true } } },
          },
        },
      });

      if (!cart?.cartItems.length) throw new AppError(400, "Cart is empty");

      const { storeId } = cart;

      // 2. Verify address belongs to this user (exclude soft-deleted)
      const address = await prisma.address.findFirst({
        where: { addressId: data.addressId, userId, deletedAt: null },
      });
      if (!address) throw new AppError(404, "Address not found");

      // 3. Fast pre-check: total stock across all stores
      await validateTotalStock(cart.cartItems);

      // 4. Fetch user info for Midtrans customer_details
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (!user) throw new AppError(404, "User not found");

      // 5. Compute cart totals
      const subtotal = calculateSubtotal(cart.cartItems);
      const weight = calculateTotalWeight(cart.cartItems);

      // 6. Resolve location IDs for shipping cost
      const originInfo = await getStoreLocationInfo(storeId);
      const destInfo = await getAddressLocationInfo(data.addressId);

      // 7. Discount accumulator
      const discount: TDiscount = {
        productItemDiscountAmmount: 0,
        referralVoucherDiscount: 0,
      };

      // 8. Apply product-level discounts
      calculateProductDiscount(cart.cartItems, discount);

      // 9. Calculate shipping cost
      let shippingCost = 0;
      if (!data.freeShippingVoucherId) {
        shippingCost = await calculateShipping(
          originInfo.cityId,
          destInfo.cityId,
          weight,
        );
      } else {
        // Validate free-shipping voucher ownership and usage
        await validateFreeShippingVoucher(data.freeShippingVoucherId, userId);
      }

      // 10. Apply referral voucher
      let grandTotal =
        subtotal - discount.productItemDiscountAmmount + shippingCost;
      if (data.referralVoucherId) {
        await validateVoucher(
          data.referralVoucherId,
          userId,
          grandTotal,
          discount,
        );
        grandTotal -= discount.referralVoucherDiscount;
      }

      const totalDiscount =
        discount.productItemDiscountAmmount + discount.referralVoucherDiscount;

      // 11. All DB writes inside a single atomic transaction
      return await prisma.$transaction(async (tx) => {
        // 11a. Create the order
        const transaction = await tx.transaction.create({
          data: {
            transactionNumber: generateInvoiceNumber(),
            userId,
            addressId: data.addressId,
            storeId,
            totalAmount: new Prisma.Decimal(subtotal),
            shippingCost: new Prisma.Decimal(shippingCost),
            totalDiscount: new Prisma.Decimal(totalDiscount),
            grandTotal: new Prisma.Decimal(grandTotal),
            transactionStatus: "WAITING_FOR_PAYMENT",
            orderItems: { create: buildOrderItems(cart.cartItems) },
          },
        });

        // 11b. Create Midtrans snap transaction and payment record
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
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });

        // 11c. Decrement stock atomically and write journal for each item
        for (const item of cart.cartItems) {
          await decrementStock(
            storeId,
            item.productId,
            item.quantity,
            transaction.transactionId,
            tx,
          );
          const stock = await tx.stock.findUnique({
            where: {
              storeId_productId: { storeId, productId: item.productId },
            },
          });
          await createStockJournal(
            stock!.stockId,
            -item.quantity,
            "ORDER_REDUCTION",
            tx,
            transaction.transactionId,
          );
        }

        // 11d. Mark vouchers as used
        if (data.freeShippingVoucherId) {
          await applyFreeShippingVoucher(
            data.freeShippingVoucherId,
            transaction.transactionId,
            tx,
          );
        }
        if (data.referralVoucherId) {
          await applyReferralVoucher(
            data.referralVoucherId,
            transaction.transactionId,
            tx,
          );
        }

        // 11e. Clear the cart
        await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } });

        await tx.cart.delete({
          where: {
            cartId: cart.cartId,
          },
        });

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
