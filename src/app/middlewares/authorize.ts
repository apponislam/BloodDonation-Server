import { NextFunction, Request, Response } from "express";

const authorize = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
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

export default authorize;
