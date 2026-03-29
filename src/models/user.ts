import { Schema, model } from "mongoose";
import type { ICreateUserInput } from "../types/user";

const userSchema = new Schema<ICreateUserInput>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: true, minlength: 8 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const User = model<ICreateUserInput>("User", userSchema);
export type IUserDocument = import("mongoose").HydratedDocument<ICreateUserInput>; //* For req.user types