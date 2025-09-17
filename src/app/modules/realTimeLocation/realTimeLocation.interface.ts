import { Types } from "mongoose";

export interface IRealtimeLocation {
    user: Types.ObjectId; // Reference to User
    serialId: string;

    // Geolocation
    latitude: number;
    longitude: number;

    // Optional details
    accuracy?: number;
    altitude?: number;
    heading?: number;
    speed?: number;
    isDeleted?: boolean;
    deletedAt?: Date;
    hideLocation?: boolean;
}
