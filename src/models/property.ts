import { Schema, model, Types } from "mongoose";
import type { ICreatePropertyInput } from "../types/property";
import { PropertyType } from "../types/app";

interface IProperty extends ICreatePropertyInput {
    owner: Types.ObjectId;
}

const propertySchema = new Schema<IProperty>(
    {
        title: { type: String, required: true, trim: true },
        location: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        type: {
            type: String,
            enum: Object.values(PropertyType),
            required: true,
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Property = model<IProperty>("Property", propertySchema);