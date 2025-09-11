import { Types } from "mongoose";

export type Gender = "male" | "female" | "other";

export interface IProfile {
    user: Types.ObjectId;
    serialId: string;

    // Personal Info

    dateOfBirth?: Date;
    gender?: Gender;

    profileImg?: string;

    // Blood Info
    bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    lastDonationDate?: Date;
    totalDonations?: number;

    // Address Info
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };

    // Social / Emergency
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    medicalNotes?: string; // allergies, conditions

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}
