import { Schema, model } from "mongoose";
import type { ICreateUserInput } from "../types/user";

interface IUser extends ICreateUserInput {
    avatar?: string
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 8 },
        avatar: { type: String, required: false }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const User = model<IUser>("User", userSchema);
export type IUserDocument = import("mongoose").HydratedDocument<IUser>; //* For req.user types