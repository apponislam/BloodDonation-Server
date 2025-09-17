import { Types } from "mongoose";
import { IRealtimeLocation } from "./realTimeLocation.interface";
import { RealtimeLocationModel } from "./realTimeLocation.model";
import ApiError from "../../../errors/ApiError";
import httpStatus from "http-status";
import { getIO } from "../../../socket/socketHelper";
import { getDistanceInMeters } from "../../../utils/distance";

// const createOrUpdateLocation = async (userId: Types.ObjectId, locationData: Partial<IRealtimeLocation>): Promise<IRealtimeLocation> => {
//     if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

//     const location = await RealtimeLocationModel.findOneAndUpdate({ user: userId }, { $set: locationData }, { new: true, upsert: true, setDefaultsOnInsert: true }).exec();

//     if (!location) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update location");

//     const io = getIO();
//     io.emit("locationUpdated", {
//         user: location.user,
//         latitude: location.latitude,
//         longitude: location.longitude,
//         speed: location.speed,
//         heading: location.heading,
//     });

//     return location;
// };

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

    // Calculate distance from this user to all other users
    const otherUsers = await RealtimeLocationModel.find({
        user: { $ne: userId },
        hideLocation: false,
    });

    const distances = otherUsers.map((u) => ({
        user: u.user,
        distanceMeters: getDistanceInMeters(location.latitude, location.longitude, u.latitude, u.longitude),
    }));

    console.log(distances);

    // Emit distances only to this user
    // io.to(userId.toString()).emit("usersDistance", distances);
    io.to(`user::${userId}`).emit("usersDistance", distances);

    return location;
};

export const realtimeLocationServices = {
    createOrUpdateLocation,
};
