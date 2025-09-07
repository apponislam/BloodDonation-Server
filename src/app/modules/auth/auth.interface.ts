import { HydratedDocument, Types } from "mongoose";

export const roles = {
    USER: "user" as const,
    ADMIN: "admin" as const,
    MODERATOR: "moderator" as const,
};

export type Role = (typeof roles)[keyof typeof roles];

// User interface
export interface IUser {
    name: string;
    email: string;
    password: string;
    phone?: string;
    profileImg?: string; // URL to profile image
    role: Role;
    isActive: boolean;
    accountType: "email" | "google" | "facebook" | "github" | "apple";
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;

    // Email verification
    isEmailVerified?: boolean;
    verificationToken?: string;
    verificationTokenExpiry?: Date;

    // OTP Reset
    resetPasswordOtp?: string;
    resetPasswordOtpExpiry?: Date;
}

// Mongoose document type
export type IUserDocument = HydratedDocument<IUser>;

export interface ISocialUser {
    user: IUserDocument;
    accessToken: string;
    refreshToken: string;
}

export type IFacebookLoginResult = ISocialUser | { requiresEmail: true; profile: { name: string; profileImg?: string } };
