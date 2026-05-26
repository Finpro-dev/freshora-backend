import { Router } from "express";
import { locationController } from "../controllers/location.controller";

const route = Router();

route.get("/provinces", locationController.getProvinces);

route.get("/city/:provinceId", locationController.getCityByProvince);

route.get("/district/:cityId", locationController.getDistrictByCity);

export default route;
