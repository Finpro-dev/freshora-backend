import axios from "axios";
import qs from "qs";
import { SHIPING_PROVIDER } from "../configs/dotenv.config";
import { AppError } from "../utils/appErrror.util";

export const rajaOngkirService = {
  calculateShippingCost: async ({
    origin,
    destination,
    weight,
    courier,
  }: any) => {
    try {
      const params = new URLSearchParams();
      params.append("origin", origin);
      params.append("destination", destination);
      params.append("weight", weight);
      params.append("courier", courier);

      const res = await axios.post(
        "https://rajaongkir.komerce.id/api/v1/calculate/district/domestic-cost",
        params,
        {
          headers: {
            key: SHIPING_PROVIDER.RAJA_ONGKOR_SHIPPING_COST_API_KEY,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      return res.data.data.at(0).cost;
    } catch (error: any) {
      if (error.isAxiosError && error.response) {
        console.dir(error.response.data, { depth: null });
      } else {
        throw new AppError(500, "Failed to calculate shipping cost");
      }
    }
  },
};
