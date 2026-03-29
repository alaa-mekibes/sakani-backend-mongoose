import z from "zod";
import { InquiryStatus } from "../types/app";

export const createInquirySchema = z.object({
    status: z.enum(Object.values(InquiryStatus)),
}).strict();