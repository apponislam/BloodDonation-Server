"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userRole = req.user.role; // TS now knows user exists
        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
exports.default = authorize;
