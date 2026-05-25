import { snap } from "../configs/midtrans.config";

export const paymentService = {
  createPayment: async () => {
    let parameter = {
      transaction_details: {
        order_id: "TEST-T123456781", // unique
        gross_amount: 10000,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: "novpa",
        last_name: "pratama",
        email: "agungnovpa@gmail.com",
        phone: "08111222333",
      },
    };

    const res = await snap.createTransaction(parameter);
    const transactionToken = res.token;

    return transactionToken;
  },
};
