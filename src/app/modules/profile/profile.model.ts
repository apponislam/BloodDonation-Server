import { Schema, model } from "mongoose";
import { IProfile } from "./profile.interface";

const profileSchema = new Schema<IProfile>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        serialId: { type: String, required: true, unique: true },

        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"] },

        profileImg: { type: String },

        bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
        lastDonationDate: { type: Date },
        totalDonations: { type: Number, default: 0 },

        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            postalCode: { type: String },
            country: { type: String },
        },

        emergencyContactName: { type: String },
        emergencyContactPhone: { type: String },
        medicalNotes: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const ProfileModel = model<IProfile>("Profile", profileSchema);
