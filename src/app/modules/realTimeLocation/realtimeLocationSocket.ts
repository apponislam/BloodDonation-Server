import { Server, Socket } from "socket.io";
import { RealtimeLocationModel } from "./realTimeLocation.model";
import { getDistanceInMeters } from "../../../utils/distance";

export const locationSocketHandler = (io: Server, socket: Socket) => {
    // join personal room
    socket.on("joinRoom", (userId: string) => {
        socket.join(`user::${userId}`);
        console.log("📥 Joining room for user:", `user::${userId}`);
    });

    // listen for real-time location updates
    socket.on("updateLocation", async (data: { userId: string; latitude: number; longitude: number; speed?: number; heading?: number }) => {
        const { userId, latitude, longitude, speed = 0, heading = 0 } = data;

        // update this user's location in DB
        const location = await RealtimeLocationModel.findOneAndUpdate({ user: userId }, { $set: { latitude, longitude, speed, heading } }, { new: true, upsert: true, setDefaultsOnInsert: true });

        if (!location) return;

        // get all users except current
        const otherUsers = await RealtimeLocationModel.find({
            user: { $nin: [userId, null] },
            hideLocation: false,
        });

        // console.log(otherUsers);

        // calculate distance from this user to all others
        const distances = otherUsers.map((u) => ({
            serialId: u.serialId,
            user: u.user,
            latitude: u.latitude,
            longitude: u.longitude,
            distanceMeters: getDistanceInMeters(latitude, longitude, u.latitude, u.longitude),
        }));

        // send back **all users + distance from current user**
        socket.emit(`usersDistance`, distances);
        // socket.emit(`usersDistance`, otherUsers);

        // also emit to all other users (optional) the updated location
        io.emit("locationUpdated", {
            serialId: location.serialId,
            user: location.user,
            latitude: location.latitude,
            longitude: location.longitude,
            speed: location.speed,
            heading: location.heading,
        });
    });
};
