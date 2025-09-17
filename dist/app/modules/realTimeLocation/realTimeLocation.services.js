"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeLocationServices = void 0;
const realTimeLocation_model_1 = require("./realTimeLocation.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const socketHelper_1 = require("../../../socket/socketHelper");
const distance_1 = require("../../../utils/distance");
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
const createOrUpdateLocation = (userId, locationData) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    const location = yield realTimeLocation_model_1.RealtimeLocationModel.findOneAndUpdate({ user: userId }, { $set: locationData }, { new: true, upsert: true, setDefaultsOnInsert: true }).exec();
    if (!location)
        throw new ApiError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to update location");
    const io = (0, socketHelper_1.getIO)();
    // Emit this user's location
    io.emit("locationUpdated", {
        user: location.user,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
    });
    // Calculate distance from this user to all other users
    const otherUsers = yield realTimeLocation_model_1.RealtimeLocationModel.find({
        user: { $ne: userId },
        hideLocation: false,
    });
    const distances = otherUsers.map((u) => ({
        user: u.user,
        distanceMeters: (0, distance_1.getDistanceInMeters)(location.latitude, location.longitude, u.latitude, u.longitude),
    }));
    console.log(distances);
    // Emit distances only to this user
    // io.to(userId.toString()).emit("usersDistance", distances);
    io.to(`user::${userId}`).emit("usersDistance", distances);
    return location;
});
exports.realtimeLocationServices = {
    createOrUpdateLocation,
};
