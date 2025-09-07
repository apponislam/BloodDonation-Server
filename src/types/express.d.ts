import type { IUserDocument } from "../app/modules/auth.interface";

declare global {
    namespace Express {
        interface User extends Partial<IUserDocument> {}
    }
}

export {};
