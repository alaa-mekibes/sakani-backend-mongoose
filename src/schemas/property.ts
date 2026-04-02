import z from "zod";
import { objectId } from "../lib/zod";
import { PropertyType } from "../types/app";

export const createPropertySchema = z.object({
    title: z.string().min(3),
    price: z.coerce.number().positive(),
    location: z.string(),
    type: z.enum(Object.values(PropertyType)),
}).strict();

export const updatePropertySchema = z.object({
    title: z.string().min(3).optional(),
    price: z.coerce.number().positive().optional(),
    location: z.string().optional(),
    type: z.enum(Object.values(PropertyType)).optional(),
    existingImages: z
        .union([z.string(), z.array(z.string())])
        .transform(v => [v].flat())
        .optional()
        .default([]),
}).strict();

export const searchPropertySchema = z.object({
    title: z.string().min(3).optional(),
    price: z.coerce.number().positive().optional(),
    location: z.string().optional(),
    type: z.enum(Object.values(PropertyType)).optional(),
}).strict();

export const propertyIdSchema = z.object({
    propertyId: objectId
}).strict();

export const inquiryIdSchema = z.object({
    inquiryId: objectId
}).strict();

