import z from "zod";
import { createInquirySchema } from "../schemas/inquiry";
import { inquiryIdSchema } from "../schemas/property";

export type ICreateInquiryInput = z.infer<typeof createInquirySchema>;
export type IInquiryId = z.infer<typeof inquiryIdSchema>;
