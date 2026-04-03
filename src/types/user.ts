import z from "zod";
import type { createUserSchema, loginUserSchema, resetPasswordSchema, updateUserSchema, userIdSchema, verifyEmailSchema } from "../schemas/user";

export type ICreateUserInput = z.infer<typeof createUserSchema>;
export type ILoginUserInput = z.infer<typeof loginUserSchema>;
export type IUpdateUserInput = z.infer<typeof updateUserSchema>;
export type IVerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type IResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type IUserId = z.infer<typeof userIdSchema>;