import { Types } from "mongoose";

export interface IRealtimeLocation {
    user: Types.ObjectId; // Reference to User
    serialId: string;

    // Geolocation
    latitude: number;
    longitude: number;

    // Optional details
    accuracy?: number; // GPS accuracy in meters
    altitude?: number;
    heading?: number; // direction in degrees
    speed?: number; // speed in m/s
    hideLocation?: boolean;
}
