import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { buildAdminOrderFilter, formatAdminOrderResponse } from "../utils/adminOrder.util";
import { AdminOrderListInput } from "../schemas/adminOrder.schema";

export const getAllOrders = async (
  storeId: string | null,
  filters: AdminOrderListInput
) => {
  try {
    const { search, status, startDate, endDate, sortBy, sortOrder, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where = buildAdminOrderFilter({ storeId: storeId || undefined, status, startDate, endDate, search });

    const [orders, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          store: { select: { storeId: true, name: true, address: true } },
          user: { select: { userId: true, firstName: true, lastName: true, email: true, phone: true } },
          address: { select: { addressId: true, address: true, district: true, city: true, province: true, postalCode: true } },
          orderItems: { include: { product: { select: { name: true, productPhotos: { take: 1, select: { photoUrl: true } } } } } },
          payments: { select: { paymentId: true, paymentType: true, paymentStatus: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      orders: orders.map(formatAdminOrderResponse),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page < Math.ceil(total / limit) },
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

export const getOrderDetail = async (transactionId: string, role: string, storeId: string | null) => {
  try {
    const where: Prisma.TransactionWhereInput = { transactionId, deletedAt: null };
    if (role === "STORE_ADMIN" && storeId) where.storeId = storeId;

    const order = await prisma.transaction.findFirst({
      where,
      include: {
        store: { select: { storeId: true, name: true, address: true, phone: true } },
        user: { select: { userId: true, firstName: true, lastName: true, email: true, phone: true } },
        address: { select: { addressId: true, address: true, district: true, city: true, province: true, postalCode: true } },
        orderItems: { include: { product: { select: { name: true, productPhotos: { take: 1, select: { photoUrl: true } } } } } },
        payments: { select: { paymentId: true, paymentType: true, paymentStatus: true } },
        freeShippingVoucher: { select: { freeShippingVoucherId: true, currentTotalTransactions: true } },
        referralVouchers: { select: { referralVoucherId: true, couponCode: true, discountAmount: true } },
      },
    });

    if (!order) throw new AppError(404, "Order not found");
    return formatAdminOrderResponse(order);
  } catch (error) {
    handlePrismaError(error);
  }
};

export const getOrderStats = async (role: string, storeId: string | null) => {
  try {
    const where: Prisma.TransactionWhereInput = { deletedAt: null };
    if (role === "STORE_ADMIN" && storeId) where.storeId = storeId;

    const [stats, recentOrders] = await Promise.all([
      prisma.transaction.groupBy({ by: ["transactionStatus"], where, _count: true }),
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { transactionId: true, transactionNumber: true, transactionStatus: true, grandTotal: true, createdAt: true, store: { select: { name: true } } },
      }),
    ]);

    const statusCounts = stats.reduce((acc, item) => { acc[item.transactionStatus] = item._count; return acc; }, {} as Record<string, number>);

    return {
      statusCounts: { WAITING_FOR_PAYMENT: statusCounts["WAITING_FOR_PAYMENT"] || 0, PROCESSING: statusCounts["PROCESSING"] || 0, SHIPPING: statusCounts["SHIPPING"] || 0, COMPLETED: statusCounts["COMPLETED"] || 0, CANCELED: statusCounts["CANCELED"] || 0 },
      totalOrders: Object.values(statusCounts).reduce((a, b) => a + b, 0),
      recentOrders: recentOrders.map((o) => ({ transactionId: o.transactionId, transactionNumber: o.transactionNumber, status: o.transactionStatus, grandTotal: Number(o.grandTotal), createdAt: o.createdAt, storeName: o.store.name })),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};