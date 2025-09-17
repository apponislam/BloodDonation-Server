// import bcrypt from "bcrypt";
// import { UserModel } from "../app/modules/auth/auth.model";
// import config from "../app/config";

// async function createSuperAdmin() {
//     try {
//         const existingAdmin = await UserModel.findOne({ role: "super_admin" });
//         if (existingAdmin) {
//             console.log("Super admin already exists:", existingAdmin.email);
//             return;
//         }

//         const passwordHash = await bcrypt.hash(config.superAdminPassword!, Number(config.bcrypt_salt_rounds));

//         const superAdmin = await UserModel.create({
//             serialId: "BDU-000000-000000",
//             name: "Super Admin",
//             email: config.superAdminEmail,
//             password: passwordHash,
//             role: "super_admin",
//             isActive: true,
//             accountType: "email",
//             isEmailVerified: true,
//         });

//         console.log("Super admin created:", superAdmin.email, "with ID: BDU-000000-000000");
//     } catch (error) {
//         console.error("Error creating super admin:", error);
//     }
// }

// export default createSuperAdmin;

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserModel } from "../app/modules/auth/auth.model";
import { ProfileModel } from "../app/modules/profile/profile.model";
import config from "../app/config";
import { RealtimeLocationModel } from "../app/modules/realTimeLocation/realTimeLocation.model";

async function createSuperAdmin() {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Check if super admin already exists
        const existingAdmin = await UserModel.findOne({ role: "super_admin" }).session(session);
        if (existingAdmin) {
            console.log("✅ Super admin already exists:", existingAdmin.email);
            await session.abortTransaction();
            session.endSession();
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(config.superAdminPassword!, Number(config.bcrypt_salt_rounds));

        // Prepare user data
        const userData: any = {
            serialId: "BDU-000000-000000",
            name: "Super Admin",
            email: config.superAdminEmail,
            password: passwordHash,
            role: "super_admin",
            isActive: true,
            accountType: "email",
            isEmailVerified: true,
        };

        // Temporary ObjectIds for profile & location
        const tempProfileId = new mongoose.Types.ObjectId();
        const tempLocationId = new mongoose.Types.ObjectId();

        userData.profile = tempProfileId;
        userData.realtimeLocation = tempLocationId;

        // Create user
        const users = await UserModel.create([userData], { session });
        const superAdmin = users[0];

        // Create profile and realtimeLocation
        await Promise.all([
            ProfileModel.create(
                [
                    {
                        _id: tempProfileId,
                        user: superAdmin._id,
                        serialId: superAdmin.serialId,
                        profileImg: undefined,
                    },
                ],
                { session }
            ),
            RealtimeLocationModel.create(
                [
                    {
                        _id: tempLocationId,
                        user: superAdmin._id,
                        serialId: superAdmin.serialId,
                        latitude: 0,
                        longitude: 0,
                        hideLocation: true,
                    },
                ],
                { session }
            ),
        ]);

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Populate user
        const populatedSuperAdmin = await UserModel.findById(superAdmin._id).populate("profile").populate("realtimeLocation").exec();

        console.log("✅ Super admin created:", populatedSuperAdmin?.email, "with ID:", populatedSuperAdmin?.serialId);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ Error creating super admin:", error);
    }
}

export default createSuperAdmin;
