import { Router } from "express";
import auth from "../../middlewares/auth";
import { profileControllers } from "./profile.controllers";

const router = Router();

router.put("/update/me", auth, profileControllers.updateMyProfile);

export const profileRoute = router;
