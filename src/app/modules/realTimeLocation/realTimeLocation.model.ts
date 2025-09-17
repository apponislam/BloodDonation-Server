import { Schema, model } from "mongoose";
import { IRealtimeLocation } from "./realTimeLocation.interface";

const realtimeLocationSchema = new Schema<IRealtimeLocation>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        serialId: { type: String, required: true, unique: true },

        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },

        accuracy: { type: Number },
        altitude: { type: Number },
        heading: { type: Number },
        speed: { type: Number },

        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },

        hideLocation: { type: Boolean, default: false },
    },
    {
        timestamps: true, // only track last update
        versionKey: false,
    }
);

export const RealtimeLocationModel = model<IRealtimeLocation>("RealtimeLocation", realtimeLocationSchema);
