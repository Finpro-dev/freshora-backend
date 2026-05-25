import { PaymentStatus } from "../../generated/prisma/enums";

export const mapMidtransToPaymentStatus = (
  midtransStatus: string,
): PaymentStatus => {
  switch (midtransStatus?.toLowerCase()) {
    case "pending":
      return PaymentStatus.PENDING;

    case "settlement":
    case "capture": // Sukses khusus Kartu Kredit di Midtrans disebut 'capture'
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
      // Fallback aman jika ada status tidak terduga dari API Midtrans
      return PaymentStatus.PENDING;
  }
};
