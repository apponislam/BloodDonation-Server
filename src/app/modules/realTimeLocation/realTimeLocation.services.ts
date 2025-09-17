import { Types } from "mongoose";
import { IRealtimeLocation } from "./realTimeLocation.interface";
import { RealtimeLocationModel } from "./realTimeLocation.model";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { getIO } from "../../../socket/socketHelper";
import { getDistanceInMeters } from "../../../utils/distance";

const createOrUpdateLocation = async (userId: Types.ObjectId, locationData: Partial<IRealtimeLocation>): Promise<IRealtimeLocation> => {
    if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

    const location = await RealtimeLocationModel.findOneAndUpdate({ user: userId }, { $set: locationData }, { new: true, upsert: true, setDefaultsOnInsert: true }).exec();

    if (!location) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update location");

    const io = getIO();

    // Emit this user's location
    io.emit("locationUpdated", {
        user: location.user,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
    });

    const otherUsers = await RealtimeLocationModel.find({
        user: { $nin: [userId, null] },
        hideLocation: false,
    });

    const distances = otherUsers.map((u) => ({
        serialId: u.serialId,
        user: u.user,
        latitude: u.latitude,
        longitude: u.longitude,
        distanceMeters: getDistanceInMeters(location.latitude, location.longitude, u.latitude, u.longitude),
    }));

    io.to(`user::${userId}`).emit("usersDistance", distances);

    return location;
};

const toggleHideLocation = async (userId: Types.ObjectId): Promise<IRealtimeLocation> => {
    if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

    const location = await RealtimeLocationModel.findOne({ user: userId });

    if (!location) throw new ApiError(httpStatus.NOT_FOUND, "Location not found");

    location.hideLocation = !location.hideLocation; // toggle
    await location.save();

    return location;
};

export const realtimeLocationServices = {
    createOrUpdateLocation,
    toggleHideLocation,
};
