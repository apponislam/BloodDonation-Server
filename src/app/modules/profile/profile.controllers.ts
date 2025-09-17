import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse.";
import { Types } from "mongoose";
import { IProfile } from "./profile.interface";
import { profileServices } from "./profile.services";
import httpStatus from "http-status";

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id as Types.ObjectId;
    const profileData = req.body as Partial<IProfile>;

    const profile = await profileServices.createOrUpdateProfile(userId, profileData);

    sendResponse<IProfile>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        data: profile,
    });
});

export const profileControllers = {
    updateMyProfile,
};
