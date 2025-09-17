import { Router } from "express";
import { realtimeLocationControllers } from "./realTimeLocation.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/update", auth, realtimeLocationControllers.updateMyLocation);

export const realTimeLocationRoutes = router;
