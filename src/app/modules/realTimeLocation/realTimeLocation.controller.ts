import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse.";
import { Types } from "mongoose";
import { IRealtimeLocation } from "./realTimeLocation.interface";
import httpStatus from "http-status";
import { realtimeLocationServices } from "./realTimeLocation.services";

const updateMyLocation = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id as Types.ObjectId;
    const locationData = req.body as Partial<IRealtimeLocation>;

    const location = await realtimeLocationServices.createOrUpdateLocation(userId, locationData);

    sendResponse<IRealtimeLocation>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Location updated successfully",
        data: location,
    });
});

const toggleHideLocation = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?._id as Types.ObjectId;

    const location = await realtimeLocationServices.toggleHideLocation(userId);

    sendResponse<IRealtimeLocation>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `hideLocation is now ${location.hideLocation}`,
        data: location,
    });
});

export const realtimeLocationControllers = {
    updateMyLocation,
    toggleHideLocation,
};
