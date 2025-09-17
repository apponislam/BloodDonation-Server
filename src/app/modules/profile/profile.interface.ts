import { Types } from "mongoose";

export type Gender = "male" | "female" | "other";

interface IEmergencyContact {
    name: string;
    phone: string;
}

interface IMedicalNote {
    type: string;
    description: string;
}

export interface IProfile {
    user: Types.ObjectId;
    serialId: string;

    // Personal Info

    dateOfBirth?: Date;
    gender?: Gender;

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

    isDeleted?: boolean;
    deletedAt?: Date;

    // Social / Emergency
    emergencyContacts?: IEmergencyContact[];
    medicalNotes?: IMedicalNote[];

    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}
