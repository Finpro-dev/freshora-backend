import { z } from "zod";

// Schema for Midtrans webhook payload validation
export const midtransWebhookSchema = z.object({
  body: z.object({
    order_id: z.string().min(1, "Order ID is required"),
    transaction_status: z.string().min(1, "Transaction status is required"),
    payment_type: z.string().min(1, "Payment type is required"),
    transaction_id: z.string().optional(),
    status_code: z.string().optional(),
    gross_amount: z.string().optional(),
  }),
});

export type MidtransWebhookInput = z.infer<typeof midtransWebhookSchema>["body"];