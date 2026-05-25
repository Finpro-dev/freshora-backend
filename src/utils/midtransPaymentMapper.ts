import { PaymentStatus } from "../../generated/prisma/enums";

export const mapMidtransToPaymentStatus = (
  midtransStatus: string,
): PaymentStatus => {
  switch (midtransStatus?.toLowerCase()) {
    case "pending":
      return PaymentStatus.PENDING;

    case "settlement":
    case "capture": // success for credit card
      return PaymentStatus.SETTLEMENT;

    case "deny":
      return PaymentStatus.DENIED;

    case "expire":
      return PaymentStatus.EXPIRED;

    case "cancel":
      return PaymentStatus.CANCELLED;

    case "refund":
    case "partial_refund":
      return PaymentStatus.REFUNDED;

    default:
      // safe fallback incase midtrans throw unexpected status
      return PaymentStatus.PENDING;
  }
};
