import { Router } from "express";
import { realtimeLocationControllers } from "./realTimeLocation.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post("/update", auth, realtimeLocationControllers.updateMyLocation);

router.patch("/toggle-hide", auth, realtimeLocationControllers.toggleHideLocation);

export const realTimeLocationRoutes = router;
