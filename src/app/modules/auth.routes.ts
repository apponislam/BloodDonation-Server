import { Router } from "express";
import { authControllers } from "./auth.controller";
import validateRequest from "../middlewares/validateRequest";
import { loginSchema, registerSchema } from "./auth.validation";
import { handleFileOrJson } from "../../utils/handleFileOrJson";
const router = Router();

router.post("/register", handleFileOrJson({ fileField: "profile" }), validateRequest(registerSchema), authControllers.register);

router.post("/login", validateRequest(loginSchema), authControllers.login);

router.post("/refresh-token", authControllers.refreshAccessToken);

router.post("/logout", authControllers.logout);

export const authRoutes = router;
