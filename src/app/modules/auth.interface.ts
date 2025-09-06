export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    profileImg?: string; // URL to uploaded profile image
    role: "user" | "admin" | "moderator";
    isActive: boolean;
    accountType: "email" | "google" | "facebook" | "github" | "apple";
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
