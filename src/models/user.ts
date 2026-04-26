import { Schema, model } from "mongoose";
import type { ICreateUserInput } from "../types/user";

interface IUser extends ICreateUserInput {
    avatar?: string;
    isVerified: boolean;
    verificationCode: string | null;
    verificationExpiry: Date | null;
    resetPasswordCode: string | null;
    resetPasswordExpiry: Date | null;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 8 },
        avatar: { type: String, required: false },
        isVerified: { type: Boolean, default: false },
        verificationCode: { type: String },
        verificationExpiry: { type: Date },
        resetPasswordCode: { type: String },
        resetPasswordExpiry: { type: Date },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const User = model<IUser>("User", userSchema);
export type IUserDocument = import("mongoose").HydratedDocument<IUser>; //* For req.user types