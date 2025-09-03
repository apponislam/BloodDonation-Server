"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    profileImg: { type: String },
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: function (doc, ret) {
            if (ret.password) {
                delete ret.password;
            }
            if (ret.__v) {
                delete ret.__v;
            }
            return ret;
        },
    },
});
userSchema.post("save", function (doc, next) {
    doc.password = undefined;
    next();
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
