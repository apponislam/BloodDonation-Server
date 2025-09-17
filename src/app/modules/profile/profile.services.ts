import { Types } from "mongoose";
import { IProfile } from "./profile.interface";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { ProfileModel } from "./profile.model";

const createOrUpdateProfile = async (userId: Types.ObjectId, profileData: Partial<IProfile>): Promise<IProfile> => {
    if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

    const existingProfile = await ProfileModel.findOne({ user: userId }).exec();

    const updatedData: Partial<IProfile> = { ...profileData };

    if (profileData.emergencyContacts && existingProfile?.emergencyContacts) {
        updatedData.emergencyContacts = [...existingProfile.emergencyContacts, ...profileData.emergencyContacts];
    }

    if (profileData.medicalNotes && existingProfile?.medicalNotes) {
        updatedData.medicalNotes = [...existingProfile.medicalNotes, ...profileData.medicalNotes];
    }

    const profile = await ProfileModel.findOneAndUpdate({ user: userId }, { $set: updatedData }, { new: true, upsert: true, setDefaultsOnInsert: true }).exec();

    if (!profile) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update profile");

    return profile;
};

export const profileServices = {
    createOrUpdateProfile,
};
