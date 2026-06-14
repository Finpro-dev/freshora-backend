import { Prisma, TransactionStatus } from "../../generated/prisma/client";
import { AppError } from "./appError.util";

// Valid order status transitions for admin actions
const ADMIN_STATUS_TRANSITIONS: Record<TransactionStatus, TransactionStatus[]> = {
  WAITING_FOR_PAYMENT: ["CANCELED"],
  PROCESSING: ["SHIPPING", "CANCELED"],
  SHIPPING: [],
  COMPLETED: [],
  CANCELED: [],
};

// Validates if status transition is allowed for admin
export const validateAdminStatusTransition = (
  currentStatus: TransactionStatus,
  newStatus: TransactionStatus
): void => {
  const allowed = ADMIN_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(400, `Cannot change status from ${currentStatus} to ${newStatus}`);
  }
};

// Builds filter query for admin order list
export const buildAdminOrderFilter = (filters: {
  storeId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Prisma.TransactionWhereInput => {
  const where: Prisma.TransactionWhereInput = { deletedAt: null };

  if (filters.storeId) where.storeId = filters.storeId;
  if (filters.status) where.transactionStatus = filters.status as TransactionStatus;

  if (filters.startDate) {
    const start = new Date(filters.startDate);
    if (!isNaN(start.getTime())) where.createdAt = { gte: start };
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate);
    if (!isNaN(end.getTime())) where.createdAt = { ...(where.createdAt as object || {}), lte: end };
  }

  if (filters.search) {
    where.transactionNumber = { contains: filters.search, mode: "insensitive" };
  }

  return where;
};

// Format order response for admin view
export const formatAdminOrderResponse = (order: any) => ({
  transactionId: order.transactionId,
  transactionNumber: order.transactionNumber,
  status: order.transactionStatus,
  totalAmount: Number(order.totalAmount),
  shippingCost: Number(order.shippingCost),
  totalDiscount: Number(order.totalDiscount),
  grandTotal: Number(order.grandTotal),
  createdAt: order.createdAt,
  processedAt: order.processedAt,
  shippedAt: order.shippedAt,
  cancelledAt: order.cancelledAt,
  completedAt: order.completedAt,
  store: order.store
    ? { storeId: order.store.storeId, name: order.store.name, address: order.store.address }
    : null,
  user: order.user
    ? { userId: order.user.userId, firstName: order.user.firstName, lastName: order.user.lastName, email: order.user.email, phone: order.user.phone }
    : null,
  address: order.address
    ? { addressId: order.address.addressId, fullAddress: order.address.address, district: order.address.district, city: order.address.city, province: order.address.province, postalCode: order.address.postalCode }
    : null,
  orderItems: order.orderItems?.map((item: any) => ({
    orderItemId: item.orderItemId,
    productId: item.productId,
    productName: item.product?.name,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    discountAmount: Number(item.discountAmount),
    subtotal: Number(item.subtotal),
    photo: item.product?.productPhotos?.[0]?.photoUrl || null,
  })),
  payment: order.payments?.[0]
    ? { paymentId: order.payments[0].paymentId, paymentType: order.payments[0].paymentType, paymentStatus: order.payments[0].paymentStatus }
    : null,
  freeShippingVoucher: order.freeShippingVoucher
    ? { voucherId: order.freeShippingVoucher.freeShippingVoucherId, currentTotalTransactions: order.freeShippingVoucher.currentTotalTransactions }
    : null,
  referralVoucher: order.referralVouchers?.[0]
    ? { voucherId: order.referralVouchers[0].referralVoucherId, couponCode: order.referralVouchers[0].couponCode, discountAmount: Number(order.referralVouchers[0].discountAmount) }
    : null,
});