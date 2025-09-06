"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: function () {
            return this.accountType === "email";
        },
        validate: {
            validator: function (value) {
                if (this.accountType === "email") {
                    return !!value && value.length > 0;
                }
                return true;
            },
            message: "Password is required for email accounts",
        },
    },
    phone: { type: String },
    profileImg: { type: String },
    role: {
        type: String,
        enum: {
            values: ["user", "admin", "moderator"],
            message: "Role must be either user, admin, or moderator",
        },
        default: "user",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    accountType: {
        type: String,
        enum: {
            values: ["email", "google", "facebook", "github", "apple"],
            message: "Account type must be email, google, facebook, github, or apple",
        },
        default: "email",
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: {
        transform: function (doc, ret) {
            if (ret.password)
                delete ret.password;
            if (ret.__v)
                delete ret.__v;
            return ret;
        },
    },
});
// Remove password after save for safety
userSchema.post("save", function (doc, next) {
    doc.password = undefined;
    next();
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
