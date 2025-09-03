export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    profileImg?: string; // URL to uploaded profile image
    role: "user" | "admin" | "moderator";
    isActive: boolean;
    lastLogin?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
