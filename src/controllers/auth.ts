import type { Request, Response } from "express";
import type { ICreateUserInput, ILoginUserInput, IResetPasswordInput, IUpdateUserInput, IUserId, IVerifyEmailInput } from "../types/user";
import generateToken from "../utils/generateToken";
import { User } from "../models/user";
import { ConflictError, NotFoundError } from "../errors";
import bcrypt from 'bcryptjs';
import { ApiResponse } from "../utils/apiResponse";
import { Property } from "../models/property";
import { extractPublicId } from "cloudinary-build-url";
import cloudinary from "../config/cloudinary";
import { generateVerificationCodeAndExpiry } from "../utils/generateVerificationCodeAndExpiry";
import { sendResetPasswordEmail, sendVerificationEmail, sendWelcomeEmail } from "../config/mailer";

class AuthController {
    public async registerUser(req: Request, res: Response) {
        const body = req.validated?.body as ICreateUserInput;

        const userExists = await User.findOne({ email: body.email });
        if (userExists) throw new ConflictError("This email is already exists");

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const { code, expiry } = generateVerificationCodeAndExpiry();

        const user = await User.create({ ...body, password: hashedPassword, verificationCode: code, verificationExpiry: expiry, })

        sendVerificationEmail(user.email, code);

        return res.status(201).json(ApiResponse.success(null, 'Check your email for the verification code'));
    }

    public async loginUser(req: Request, res: Response) {
        const body = req.validated?.body as ILoginUserInput;

        const user = await User.findOne({ email: body.email });
        if (!user) throw new ConflictError("The email or password is incorrect");

        const passwordIsCorrect = await bcrypt.compare(body.password, user?.password);
        if (!passwordIsCorrect) throw new ConflictError("The email or password is incorrect");

        if (!user.isVerified) {
            const { code, expiry } = generateVerificationCodeAndExpiry();
            user.verificationCode = code;
            user.verificationExpiry = expiry;
            await user.save();
            sendVerificationEmail(user.email, code);
            throw new ConflictError("Please verify your email first");
        }

        const token = generateToken(user.id, res);

        const { password, ...safeUser } = user.toObject();

        return res.status(200).json(ApiResponse.success(safeUser, '', { token }));
    }

    public async logoutUser(_: Request, res: Response) {
        res.cookie('jwt', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'PRODUCTION',
            sameSite: process.env.NODE_ENV === 'PRODUCTION' ? 'none' : 'lax',
            expires: new Date(0),
        });

        return res.status(200).json(ApiResponse.success("ok"));
    }

    public async removeUser(req: Request, res: Response) {
        const userId = req.user!.id;

        const user = await User.findById(userId);
        if (!user) throw new NotFoundError("User is not found");

        const properties = await Property.find({ owner: userId });

        const cloudinaryTargets: string[] = [
            user.avatar,
            ...properties.flatMap((p) => p.images || []),
        ].filter(Boolean) as string[];

        if (cloudinaryTargets.length > 0) {
            const results = await Promise.allSettled(
                cloudinaryTargets.map((img) =>
                    cloudinary.uploader.destroy(extractPublicId(img))
                )
            );

            results.forEach((result, i) => {
                if (result.status === "rejected") {
                    console.error(
                        `Failed to delete asset ${cloudinaryTargets[i]}:`,
                        result.reason
                    );
                }
            });
        }

        await Promise.all([
            User.deleteOne({ _id: userId }),
            Property.deleteMany({ owner: userId }),
        ]);

        return res.status(200).json(ApiResponse.success("ok"));
    }

    public async verifyEmail(req: Request, res: Response) {
        const { email, code } = req.validated?.body as IVerifyEmailInput;

        const user = await User.findOne({ email });
        if (!user) throw new NotFoundError('User not found');

        if (user.isVerified) throw new ConflictError('Already verified');

        if (user.verificationCode !== code) {
            throw new ConflictError('Invalid code');
        }

        if (!user.verificationExpiry || user.verificationExpiry < new Date()) {
            throw new ConflictError('Code expired');
        }

        user.isVerified = true;
        user.verificationCode = null;
        user.verificationExpiry = null;
        await user.save();

        sendWelcomeEmail(user.email, user.name);

        const token = generateToken(user.id, res);
        const { password, ...safeUser } = user.toObject();

        return res.json(ApiResponse.success(safeUser, '', { token }));
    }

    public async resendVerificationCode(req: Request, res: Response) {
        const { email } = req.validated?.body as { email: string };

        const user = await User.findOne({ email });
        if (!user) throw new NotFoundError('User not found');
        if (user.isVerified) throw new ConflictError('Already verified');

        const cooldown = 60 * 1000; // 1 minute
        if (user.verificationExpiry && user.verificationExpiry.getTime() - 9 * 60 * 1000 > Date.now() - cooldown) {
            throw new ConflictError('Please wait 1 minute before requesting a new code');
        }

        const { code, expiry } = generateVerificationCodeAndExpiry();

        user.verificationCode = code;
        user.verificationExpiry = expiry;
        await user.save();

        sendVerificationEmail(user.email, code).catch((err) => {
            console.error("Failed to send email:", err);
        });

        return res.json(ApiResponse.success(null, 'Code resent successfully'));
    }

    public async forgotPassword(req: Request, res: Response) {
        const { email } = req.validated?.body as { email: string };

        const user = await User.findOne({ email });

        //* Best practice
        if (!user) return res.json(ApiResponse.success(null, 'If this email exists you will receive a code'));

        const { code, expiry } = generateVerificationCodeAndExpiry();


        user.resetPasswordCode = code;
        user.resetPasswordExpiry = expiry;
        await user.save();

        sendResetPasswordEmail(user.email, code).catch((err) => {
            console.error("Failed to send email:", err);
        });

        return res.json(ApiResponse.success(null, 'If this email exists you will receive a code'));
    }

    public async resetPassword(req: Request, res: Response) {
        const { email, code, password } = req.validated?.body as IResetPasswordInput;

        const user = await User.findOne({ email });
        if (!user) throw new NotFoundError('User not found');

        if (user.resetPasswordCode !== code) throw new ConflictError('Invalid code');

        if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
            throw new ConflictError('Code expired');
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordCode = null;
        user.resetPasswordExpiry = null;
        await user.save();

        return res.json(ApiResponse.success(null, 'Password reset successfully'));
    }

    public async getMyProfile(req: Request, res: Response) {
        const userId = req.user!.id;
        const user = await User.findById(userId);

        if (!user) throw new NotFoundError("the user is not found");

        const { password, ...safeUser } = user.toObject();

        return res.status(200).json(ApiResponse.success(safeUser));
    }

    public async getUserProfile(req: Request, res: Response) {
        const { userId } = req.validated.params as IUserId;

        const user = await User.findById(userId);
        if (!user) throw new NotFoundError("the user is not found");

        const { password, ...safeUser } = user.toObject();

        return res.status(200).json(ApiResponse.success(safeUser));
    }

    public async updateMyProfile(req: Request, res: Response) {
        const userId = req.user!.id;
        const { ...body } = req.validated?.body as IUpdateUserInput;
        const newImage = req.uploadedImages?.[0] ?? '';

        const user = await User.findById(userId);
        if (!user) throw new NotFoundError("user is not found");

        const oldAvatar = user.avatar ?? null;
        const avatar = newImage || user.avatar;

        if (body.password) body.password = await bcrypt.hash(body.password, 10);
        const newUser = await User.findByIdAndUpdate(
            userId,
            { ...body, ...(newImage && { avatar }), updatedAt: new Date() },
            { returnDocument: 'after' }
        );
        if (!newUser) throw new NotFoundError("User not found");

        if (newImage && oldAvatar) {
            try {
                await cloudinary.uploader.destroy(extractPublicId(oldAvatar))
            } catch (err) {
                console.error('Failed to delete old avatar from Cloudinary:', err);
            }
        }

        const { password, ...safeUser } = newUser.toObject();
        return res.status(200).json(ApiResponse.success(safeUser));
    }
}

export default AuthController;
