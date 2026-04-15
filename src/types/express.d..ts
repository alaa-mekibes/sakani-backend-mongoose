import type { IUserDocument } from "../models/user";

declare global {
    namespace Express {
        interface Request {
            user?: IUserDocument,
            validated: { body?: unknown; params?: unknown; query?: unknown };
            uploadedImages?: string[];
        }
    }
}
