"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authControllers = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const auth_services_1 = require("./auth.services");
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse."));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const register = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.authServices.registerUser(req, req.body);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: config_1.default.node_env === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
}));
const login = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_services_1.authServices.loginUser(req.body);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: config_1.default.node_env === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
}));
const refreshAccessToken = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Refresh token is required");
    }
    const result = yield auth_services_1.authServices.refreshToken(refreshToken);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Access token refreshed successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
}));
const logout = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config_1.default.node_env === "production",
        sameSite: "strict",
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User logged out successfully",
        data: null,
    });
}));
exports.authControllers = {
    register,
    login,
    refreshAccessToken,
    logout,
};
