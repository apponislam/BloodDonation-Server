import crypto from "crypto";

export const generateVerificationToken = (expiryHours = 24) => {
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    return { token, expiry };
};
