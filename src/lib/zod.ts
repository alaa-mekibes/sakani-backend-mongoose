import mongoose from "mongoose";
import z from "zod";

//* For checking id
export const objectId = z
    .string()
    .refine((val) => mongoose.isValidObjectId(val), {
        message: "Invalid MongoDB ObjectId",
    });
