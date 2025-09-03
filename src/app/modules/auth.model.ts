import { model, Schema } from "mongoose";
import { IUser } from "./auth.interface";

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String },
        profileImg: { type: String },
        role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: {
            transform: function (doc, ret) {
                if (ret.password) {
                    delete (ret as any).password;
                }
                if (ret.__v) {
                    delete (ret as any).__v;
                }
                return ret;
            },
        },
    }
);

userSchema.post("save", function (doc, next) {
    doc.password = undefined as any;
    next();
});

export const UserModel = model<IUser>("User", userSchema);
