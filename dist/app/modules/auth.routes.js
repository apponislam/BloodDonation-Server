"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const uploadProfile_1 = require("../middlewares/uploadProfile");
const auth_controller_1 = require("./auth.controller");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const auth_validation_1 = require("./auth.validation");
const parseFormData_1 = require("../utils/parseFormData");
const router = (0, express_1.Router)();
router.post("/register", uploadProfile_1.uploadProfile.single("profile"), parseFormData_1.parseFormDataJson, (0, validateRequest_1.default)(auth_validation_1.registerSchema), auth_controller_1.authControllers.register);
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.loginSchema), auth_controller_1.authControllers.login);
router.post("/refresh-token", auth_controller_1.authControllers.refreshAccessToken);
router.post("/logout", auth_controller_1.authControllers.logout);
exports.authRoutes = router;
