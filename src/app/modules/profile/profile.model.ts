import mongoose, { Schema, model } from "mongoose";
import { IProfile } from "./profile.interface";

const EmergencyContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
});

const MedicalNoteSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
});

const profileSchema = new Schema<IProfile>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        serialId: { type: String, required: true, unique: true },

        dateOfBirth: { type: Date },
        gender: { type: String, enum: ["male", "female", "other"] },

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

        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        emergencyContacts: [EmergencyContactSchema],
        medicalNotes: [MedicalNoteSchema],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const ProfileModel = model<IProfile>("Profile", profileSchema);
