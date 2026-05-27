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
  validateStockAtStore,
  getStoreLocationInfo,
  getAddressLocationInfo,
} from "../utils/transactionHelper.util";
import { rajaOngkirService } from "./rajaOngkir.service";

const createOrderItems = (cartItems: any[]) =>
  cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.product.price,
    discountAmount: 0,
    subTotalItem: Number(item.product.price) * item.quantity,
  }));

export const transactionService = {
  createOrder: async (userId: string, data: CreateTransactionInput) => {
    try {
      // Step 1: Fetch data & validate BEFORE transaction
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

      // Validate stock
      await validateStockAtStore(storeId, cart.cartItems);

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

      // Call external API BEFORE transaction
      const shippingList = await rajaOngkirService.calculateShippingCost({
        origin: originInfo.cityId,
        destination: destInfo.cityId,
        weight,
        courier: data.courier,
      });

      if (!shippingList || shippingList.length === 0) {
        throw new AppError(400, "No shipping options available for this courier");
      }

      const selected = shippingList.find(
        (s: any) => s.service === data.courierService,
      );
      if (!selected) throw new AppError(400, "Courier service unavailable");

      // Validate voucher before transaction
      const discount = await validateVoucher(data.voucherCode || "", userId);
      const invoice = generateInvoiceNumber();
      const shippingCost = Number(selected.cost[0]?.value || selected.cost || 0);
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
            where: { storeId_productId: { storeId, productId: item.productId } },
            data: { quantity: { decrement: item.quantity } },
          });
        }

        if (data.voucherCode) {
          await tx.referralVoucher.update({
            where: { couponCode: data.voucherCode.toUpperCase() },
            data: { transactionId: transaction.transactionId },
          });
        }

        await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } });

        return {
          transactionId: transaction.transactionId,
          snapToken: snapResponse.token,
          redirectUrl: snapResponse.redirect_url,
        };
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      handlePrismaError(error);
    }
  },
};