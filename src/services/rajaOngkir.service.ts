import axios from "axios";
import { SHIPING_PROVIDER } from "../configs/dotenv.config";
import { AppError } from "../utils/appErrror.util";
import { RAJA_ONGKIR } from "../statics/address.static";

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

      const res = await axios.post(RAJA_ONGKIR.SHIPPING_BASE_URL, params, {
        headers: {
          key: SHIPING_PROVIDER.RAJA_ONGKOR_SHIPPING_COST_API_KEY,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return res.data.data.at(0).cost;
    } catch (error: any) {
      if (error.isAxiosError && error.response) {
        console.dir(error.response.data, { depth: null });
      } else {
        throw new AppError(500, "Failed to calculate shipping cost");
      }
    }
  },

  getProvinces: async () => {
    try {
      const res = await axios.get(`${RAJA_ONGKIR.LOCATION_BASE_URL}/province`, {
        headers: {
          key: SHIPING_PROVIDER.RAJA_ONGKOR_SHIPPING_COST_API_KEY,
        },
      });

      return res.data.data;
    } catch (error) {
      throw new AppError(500, "Faild to retrieved provinces data");
    }
  },

  getCityByProvince: async (rawProvinceId: string) => {
    const provinceId = Number(rawProvinceId);

    if (isNaN(provinceId))
      throw new AppError(400, "Invalid province id, should be a number");

    try {
      const res = await axios.get(
        `${RAJA_ONGKIR.LOCATION_BASE_URL}/city/${provinceId}`,
        {
          headers: {
            key: SHIPING_PROVIDER.RAJA_ONGKOR_SHIPPING_COST_API_KEY,
          },
        },
      );

      return res.data.data;
    } catch (error) {
      throw new AppError(500, "Faild to retrieved city data");
    }
  },

  getDistrictByCity: async (rawCityId: string) => {
    const cityId = Number(rawCityId);
    console.log("CITY ID", cityId);

    if (isNaN(cityId))
      throw new AppError(400, "Invalid city id, should be a number");

    try {
      const res = await axios.get(
        `${RAJA_ONGKIR.LOCATION_BASE_URL}/district/${cityId}`,
        {
          headers: {
            key: SHIPING_PROVIDER.RAJA_ONGKOR_SHIPPING_COST_API_KEY,
          },
        },
      );

      return res.data.data;
    } catch (error) {
      throw new AppError(500, "Faild to retrieved district data");
    }
  },
};
