import { snap } from "../configs/midtrans.config";

export const paymentService = {
  createPayment: async () => {
    let parameter = {
      transaction_details: {
        order_id: "TEST-1234567", // unique
        gross_amount: 10000,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: "budi",
        last_name: "pratama",
        email: "budi.pra@example.com",
        phone: "08111222333",
      },
    };

    const res = await snap.createTransaction(parameter);
    const transactionToken = res.token;

    return transactionToken;
  },
};
