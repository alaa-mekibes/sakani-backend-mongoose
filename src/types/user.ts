import z from "zod";
import type { createUserSchema, loginUserSchema, updateUserSchema } from "../schemas/user";

export type ICreateUserInput = z.infer<typeof createUserSchema>;
export type ILoginUserInput = z.infer<typeof loginUserSchema>;
export type IUpdateUserInput = z.infer<typeof updateUserSchema>;