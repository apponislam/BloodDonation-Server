import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { authServices } from "./auth.services";
import httpStatus from "http-status";
import config from "../config";
import sendResponse from "../../utils/sendResponse.";
import ApiError from "../../errors/ApiError";

const register = catchAsync(async (req: Request, res: Response) => {
    // Handle profile image if uploaded
    const profileImg = req.file ? `/uploads/profile/${req.file.filename}` : undefined;

    const result = await authServices.registerUser({
        ...req.body,
        profileImg,
    });

    // Set refresh token in cookie
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
});

const verifyEmailController = catchAsync(async (req: Request, res: Response) => {
    const { token, id } = req.query;

    if (!token || !id) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: "Token and user ID are required",
            data: null,
        });
    }

    const user = await authServices.verifyEmailService(id as string, token as string);

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Email verified successfully",
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
        },
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const result = await authServices.loginUser(req.body);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        },
    });
});

const googleCallback = catchAsync(async (req: Request, res: Response) => {
    const { user, accessToken, refreshToken } = req.user as any;

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: "Google login successful",
        data: {
            user,
            accessToken,
            refreshToken,
        },
    });
});

const facebookCallback = catchAsync(async (req: Request, res: Response) => {
    const result = req.user as any;

    if (result.requiresEmail) {
        return res.status(200).json({
            success: true,
            message: "Facebook login requires email",
            data: result,
        });
    }

    const { user, accessToken, refreshToken } = result;

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Facebook login successful",
        data: { user, accessToken, refreshToken },
    });
});

const facebookComplete = catchAsync(async (req: Request, res: Response) => {
    const { email, profile } = req.body;

    if (!email) throw new Error("Email is required to complete Facebook login");

    // Complete login using temporary profile + email
    const result = await authServices.completeFacebookLoginWithEmail(profile, email);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Facebook login completed successfully",
        data: result,
    });
});

const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is required");
    }

    const result = await authServices.refreshToken(refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Access token refreshed successfully",
        data: {
            user: result.user,
            accessToken: result.accessToken,
        },
    });
});

const logout = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: config.node_env === "production",
        sameSite: "strict",
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged out successfully",
        data: null,
    });
});

export const authControllers = {
    register,
    verifyEmailController,
    login,
    googleCallback,
    facebookCallback,
    facebookComplete,
    refreshAccessToken,
    logout,
};
