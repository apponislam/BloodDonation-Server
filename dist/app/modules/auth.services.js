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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authServices = void 0;
const auth_model_1 = require("./auth.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const jwtHelpers_1 = require("../../utils/jwtHelpers");
const config_1 = __importDefault(require("../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const verificationToken_1 = require("../../utils/verificationToken");
const emailVerifyMail_1 = require("../../shared/emailVerifyMail");
const registerUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield auth_model_1.UserModel.findOne({ email: data.email });
    if (existing)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Email already in use");
    let hashedPassword = undefined;
    if (data.password) {
        hashedPassword = yield bcrypt_1.default.hash(data.password, Number(config_1.default.bcrypt_salt_rounds));
    }
    const userData = Object.assign(Object.assign({}, data), { password: hashedPassword });
    const { token, expiry } = (0, verificationToken_1.generateVerificationToken)(24); // 24 hours
    userData.verificationToken = token;
    userData.verificationTokenExpiry = expiry;
    userData.isEmailVerified = false;
    const user = yield auth_model_1.UserModel.create(userData);
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}&id=${user._id}`;
    yield (0, emailVerifyMail_1.sendVerificationEmail)({
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
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    const _a = user.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
});
const verifyEmailService = (userId, token) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.UserModel.findById(userId);
    if (!user)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    if (user.isEmailVerified)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Email already verified");
    if (user.verificationToken !== token)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid token");
    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date())
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Token expired");
    // Mark email as verified and remove token
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    yield user.save();
    return user;
});
const loginUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.UserModel.findOne({ email: data.email }).select("+password");
    if (!user)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    const isMatch = yield bcrypt_1.default.compare(data.password, user.password);
    if (!isMatch)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credentials");
    user.lastLogin = new Date();
    yield user.save();
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    const _a = user.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };
});
const handleGoogleLogin = (profile) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
    if (!email)
        throw new Error("Google profile does not contain email");
    let user = yield auth_model_1.UserModel.findOne({ email });
    if (!user) {
        user = yield auth_model_1.UserModel.create({
            name: profile.displayName,
            email,
            profileImg: (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
            role: "user",
            isActive: true,
            lastLogin: new Date(),
            accountType: "google",
        });
    }
    else {
        user.lastLogin = new Date();
        yield user.save();
    }
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    return { user, accessToken, refreshToken };
});
const handleFacebookLogin = (profile) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const email = (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value;
    if (!email) {
        // Return profile info so frontend can ask for email
        return {
            requiresEmail: true,
            profile: {
                name: profile.displayName,
                profileImg: (_d = (_c = profile.photos) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
            },
        };
    }
    let user = yield auth_model_1.UserModel.findOne({ email });
    if (!user) {
        user = yield auth_model_1.UserModel.create({
            name: profile.displayName,
            email,
            password: "", // empty because accountType != "email"
            profileImg: (_f = (_e = profile.photos) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.value,
            role: "user",
            isActive: true,
            accountType: "facebook",
            lastLogin: new Date(),
        });
    }
    else {
        user.lastLogin = new Date();
        yield user.save();
    }
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    return { user, accessToken, refreshToken };
});
const completeFacebookLoginWithEmail = (profile, email) => __awaiter(void 0, void 0, void 0, function* () {
    let user = yield auth_model_1.UserModel.findOne({ email });
    if (!user) {
        user = yield auth_model_1.UserModel.create({
            name: profile.name,
            email,
            password: "",
            profileImg: profile.profileImg,
            role: "user",
            isActive: true,
            accountType: "facebook",
            lastLogin: new Date(),
        });
    }
    else {
        user.lastLogin = new Date();
        yield user.save();
    }
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };
    const accessToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expire);
    const refreshToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    return { user, accessToken, refreshToken };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Refresh token is required");
    }
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = yield auth_model_1.UserModel.findById(decoded._id);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const jwtPayload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
        role: user.role,
    };
    const newAccessToken = jwtHelpers_1.jwtHelper.generateToken(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expire);
    const _a = user.toObject(), { password } = _a, userWithoutPassword = __rest(_a, ["password"]);
    return {
        accessToken: newAccessToken,
        user: userWithoutPassword,
    };
});
exports.authServices = {
    registerUser,
    verifyEmailService,
    loginUser,
    handleGoogleLogin,
    handleFacebookLogin,
    completeFacebookLoginWithEmail,
    refreshToken,
};
