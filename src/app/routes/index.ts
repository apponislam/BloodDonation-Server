import express from "express";
import { authRoutes } from "../modules/auth/auth.routes";
import { profileRoute } from "../modules/profile/profile.route";
import { userRoutes } from "../modules/user/user.routes";
import { realTimeLocationRoutes } from "../modules/realTimeLocation/realTimeLocation.routes";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: authRoutes,
    },
    {
        path: "/profile",
        route: profileRoute,
    },
    {
        path: "/user",
        route: userRoutes,
    },
    {
        path: "/location",
        route: realTimeLocationRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
