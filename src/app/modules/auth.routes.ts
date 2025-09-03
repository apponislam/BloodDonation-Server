import { Router } from "express";
import { uploadProfile } from "../middlewares/uploadProfile";
import { authControllers } from "./auth.controller";
import validateRequest from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "./auth.validation";
import { parseFormDataJson } from "../utils/parseFormData";
const router = Router();

router.post("/register", uploadProfile.single("profile"), parseFormDataJson, validateRequest(registerSchema), authControllers.register);

router.post("/login", validateRequest(loginSchema), authControllers.login);

router.post("/refresh-token", authControllers.refreshAccessToken);

router.post("/logout", authControllers.logout);

export const authRoutes = router;
