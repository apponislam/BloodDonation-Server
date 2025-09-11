import bcrypt from "bcrypt";
import { UserModel } from "../app/modules/auth/auth.model";
import config from "../app/config";

async function createSuperAdmin() {
    try {
        const existingAdmin = await UserModel.findOne({ role: "super_admin" });
        if (existingAdmin) {
            console.log("Super admin already exists:", existingAdmin.email);
            return;
        }

        const passwordHash = await bcrypt.hash(config.superAdminPassword!, Number(config.bcrypt_salt_rounds));

        const superAdmin = await UserModel.create({
            serialId: "BDU-000000-000000",
            name: "Super Admin",
            email: config.superAdminEmail,
            password: passwordHash,
            role: "super_admin",
            isActive: true,
            accountType: "email",
            isEmailVerified: true,
        });

        console.log("Super admin created:", superAdmin.email, "with ID: BDU-000000-000000");
    } catch (error) {
        console.error("Error creating super admin:", error);
    }
}

export default createSuperAdmin;
