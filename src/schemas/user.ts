import z from "zod";
import { objectId } from "../lib/zod";

export const createUserSchema = z.object({
    name: z.string().min(2).max(20),
    email: z.email(),
    password: z.string().min(8)
}).strict();

export const loginUserSchema = z.object({
    email: z.email(),
    password: z.string().min(8)
}).strict();

export const updateUserSchema = z.object({
    name: z.string().min(2).max(20).optional(),
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    existingImage: z.string().optional().default(''),
}).strict();

export const userIdSchema = z.object({
    userId: objectId
}).strict();

export const verifyEmailSchema = z.object({
    email: z.email(),
    code: z.string().length(6),
}).strict();

export const verifyOnlyEmailSchema = z.object({
    email: z.email(),
}).strict();
