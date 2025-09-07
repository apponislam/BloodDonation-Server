import { UserModel } from "./auth.model";
import { LoginInput, RegisterInput } from "./auth.validation";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import { jwtHelper } from "../../../utils/jwtHelpers";
import config from "../../config";
import ApiError from "../../../errors/ApiError";
import { generateOtp, generateVerificationToken } from "../../../utils/tokenGenerator";
import { sendVerificationEmail } from "../../../shared/emailVerifyMail";
import { sendOtpEmail } from "../../../shared/sendOtpEmail";
import { Types } from "mongoose";

const registerUser = async (data: RegisterInput & { profileImg?: string }) => {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");

    let hashedPassword: string | undefined = undefined;
    if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, Number(config.bcrypt_salt_rounds));
    }

    const userData: any = {
        ...data,
        password: hashedPassword,
    };

    const { token, expiry } = generateVerificationToken(24); // 24 hours
    userData.verificationToken = token;
    userData.verificationTokenExpiry = expiry;
    userData.isEmailVerified = false;

    const user = await UserModel.create(userData);

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}&id=${user._id}`;
    await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl,
    });

    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };

    const accessToken = jwtHelper.generateToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expire as string);

    const refreshToken = jwtHelper.generateToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expire as string);

    const { password, ...userWithoutPassword } = user.toObject();

    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};

const resendVerificationEmailService = async (userId: string) => {
    const user = await UserModel.findById(userId);

    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    if (user.isEmailVerified) throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");

    // Generate new token
    const { token, expiry } = generateVerificationToken();

    user.verificationToken = token;
    user.verificationTokenExpiry = expiry;
    await user.save();

    // Build verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&id=${user._id}`;

    // Send email
    await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verificationUrl,
    });

    return { email: user.email, sent: true };
};

const verifyEmailService = async (userId: string, token: string) => {
    const user = await UserModel.findById(userId);

    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    if (user.isEmailVerified) throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");
    if (user.verificationToken !== token) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token");
    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) throw new ApiError(httpStatus.BAD_REQUEST, "Token expired");

    // Mark email as verified and remove token
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    return user;
};

const loginUser = async (data: LoginInput) => {
    const user = await UserModel.findOne({ email: data.email }).select("+password");
    if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");

    user.lastLogin = new Date();
    await user.save();

    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };

    const accessToken = jwtHelper.generateToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expire as string);

    const refreshToken = jwtHelper.generateToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expire as string);

    const { password, ...userWithoutPassword } = user.toObject();

    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
};

// --- GOOGLE LOGIN ---
const handleGoogleLogin = async (profile: any) => {
    const email = profile.emails?.[0]?.value;
    if (!email) throw new ApiError(httpStatus.BAD_REQUEST, "Google profile does not contain email");

    let user = await UserModel.findOne({ email });

    if (!user) {
        user = await UserModel.create({
            name: profile.displayName,
            email,
            profileImg: profile.photos?.[0]?.value,
            role: "user",
            isActive: true,
            lastLogin: new Date(),
            accountType: "google",
        });
    } else {
        user.lastLogin = new Date();
        await user.save();
    }

    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };

    const accessToken = jwtHelper.generateToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expire!);
    const refreshToken = jwtHelper.generateToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expire!);

    return { user, accessToken, refreshToken };
};

// --- FACEBOOK LOGIN ---
const handleFacebookLogin = async (profile: any) => {
    const email = profile.emails?.[0]?.value;

    if (!email) {
        return {
            requiresEmail: true,
            profile: {
                name: profile.displayName,
                profileImg: profile.photos?.[0]?.value,
            },
        };
    }

    let user = await UserModel.findOne({ email });

    if (!user) {
        user = await UserModel.create({
            name: profile.displayName,
            email,
            password: "",
            profileImg: profile.photos?.[0]?.value,
            role: "user",
            isActive: true,
            accountType: "facebook",
            lastLogin: new Date(),
        });
    } else {
        user.lastLogin = new Date();
        await user.save();
    }

    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };

    const accessToken = jwtHelper.generateToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expire!);
    const refreshToken = jwtHelper.generateToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expire!);

    return { user, accessToken, refreshToken };
};

// --- COMPLETE FACEBOOK LOGIN ---
const completeFacebookLoginWithEmail = async (profile: any, email: string) => {
    let user = await UserModel.findOne({ email });

    if (!user) {
        user = await UserModel.create({
            name: profile.name,
            email,
            password: "",
            profileImg: profile.profileImg,
            role: "user",
            isActive: true,
            accountType: "facebook",
            lastLogin: new Date(),
        });
    } else {
        user.lastLogin = new Date();
        await user.save();
    }

    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };

    const accessToken = jwtHelper.generateToken(jwtPayload, config.jwt_access_secret!, config.jwt_access_expire!);
    const refreshToken = jwtHelper.generateToken(jwtPayload, config.jwt_refresh_secret!, config.jwt_refresh_expire!);

    return { user, accessToken, refreshToken };
};

const getMeService = async (userId: string | Types.ObjectId) => {
    const _id = typeof userId === "string" ? new Types.ObjectId(userId) : userId;
    const user = await UserModel.findById(_id).select("-password -resetPasswordOtp -resetPasswordOtpExpiry");
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    return user;
};

const refreshToken = async (token: string) => {
    if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
        _id: string;
        name: string;
        email: string;
        profileImg?: string;
        role: string;
    };

    const user = await UserModel.findById(decoded._id);
    if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };

    const newAccessToken = jwtHelper.generateToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expire as string);

    const { password, ...userWithoutPassword } = user.toObject();

    return {
        accessToken: newAccessToken,
        user: userWithoutPassword,
    };
};

const requestPasswordResetOtp = async (email: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const { otp, expiry } = generateOtp();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = expiry;
    await user.save();

    await sendOtpEmail({ to: user.email, name: user.name, otp });

    return { message: "OTP sent to email" };
};

const resendPasswordResetOtp = async (email: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    const { otp, expiry } = generateOtp();

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = expiry;
    await user.save();

    await sendOtpEmail({ to: user.email, name: user.name, otp });

    return { message: "OTP resent to email" };
};

const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string) => {
    const user = await UserModel.findOne({ email });
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }

    if (!user.resetPasswordOtpExpiry || user.resetPasswordOtpExpiry < new Date()) {
        throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;

    await user.save();

    return { message: "Password reset successful" };
};

const changePassword = async (userId: Types.ObjectId, currentPassword: string, newPassword: string) => {
    const user = await UserModel.findById(userId).select("+password");
    if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

    // Validate current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Current password is incorrect");
    }

    // Hash and save new password
    user.password = await bcrypt.hash(newPassword, Number(config.bcrypt_salt_rounds));
    await user.save();

    return { message: "Password changed successfully" };
};

export const authServices = {
    registerUser,
    resendVerificationEmailService,
    verifyEmailService,
    loginUser,
    handleGoogleLogin,
    handleFacebookLogin,
    completeFacebookLoginWithEmail,
    getMeService,
    refreshToken,
    requestPasswordResetOtp,
    resendPasswordResetOtp,
    resetPasswordWithOtp,
    changePassword,
};
