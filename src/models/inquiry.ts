import { Schema, Types, model } from "mongoose";
import type { ICreateInquiryInput } from "../types/inquiry";
import { InquiryStatus } from "../types/app";

interface IInquiry extends ICreateInquiryInput {
    buyer: Types.ObjectId;
    owner: Types.ObjectId;
    property: Types.ObjectId;
}

const inquirySchema = new Schema<IInquiry>(
    {
        status: {
            type: String,
            enum: Object.values(InquiryStatus),
            required: true,
            trim: true,
            default: InquiryStatus.pending
        },
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        property: {
            type: Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
        versionKey: false,
    }
);

export const Inquiry = model<IInquiry>("Inquiry", inquirySchema);