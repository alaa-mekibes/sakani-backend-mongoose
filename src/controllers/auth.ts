import type { Request, Response } from "express";
import type { ICreateUserInput, ILoginUserInput, IUpdateUserInput, IUserId, IVerifyEmailInput } from "../types/user";
import generateToken from "../utils/generateToken";
import { User } from "../models/user";
import { ConflictError, NotFoundError } from "../errors";
import bcrypt from 'bcryptjs';
import { ApiResponse } from "../utils/apiResponse";
import { Property } from "../models/property";
import { extractPublicId } from "cloudinary-build-url";
import cloudinary from "../config/cloudinary";
import { generateVerificationCodeAndExpiry } from "../utils/generateVerificationCodeAndExpiry";
import { sendVerificationEmail } from "../config/mailer";

class AuthController {
    public async registerUser(req: Request, res: Response) {
        const body = req.validated?.body as ICreateUserInput;

        const userExists = await User.findOne({ email: body.email });
        if (userExists) throw new ConflictError("This email is already exists");

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const { code, expiry } = generateVerificationCodeAndExpiry();

        const user = await User.create({ ...body, password: hashedPassword, verificationCode: code, verificationExpiry: expiry, isVerified: false, })

        await sendVerificationEmail(user.email, code);

        const token = generateToken(user.id, res);


        const { password, ...safeUser } = user.toObject();

        return res.status(201).json(ApiResponse.success(safeUser, { token }, 'Check your email for the verification code'));
    }

    public async loginUser(req: Request, res: Response) {
        const body = req.validated?.body as ILoginUserInput;

        const userExists = await User.findOne({ email: body.email });
        if (!userExists) throw new ConflictError("The email or password is incorrect");

        const passwordIsCorrect = await bcrypt.compare(body.password, userExists?.password);
        if (!passwordIsCorrect) throw new ConflictError("The email or password is incorrect");

        const token = generateToken(userExists.id, res);

        const { password, ...safeUser } = userExists.toObject();

        return res.status(200).json(ApiResponse.success(safeUser, { token }));
    }

    public async logoutUser(_: Request, res: Response) {
        res.cookie('jwt', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'PRODUCTION',
            sameSite: 'none',
            expires: new Date(0),
        });

        return res.status(200).json(ApiResponse.success("ok"));
    }

    public async removeUser(req: Request, res: Response) {
        const userId = req.user!.id;

        await Promise.all([
            User.findByIdAndDelete(userId),
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

        const token = generateToken(user.id, res);
        const { password, ...safeUser } = user.toObject();

        return res.json(ApiResponse.success(safeUser, { token }));
    }

    public async resendVerificationCode(req: Request, res: Response) {
        const { email } = req.validated?.body as { email: string };

        const user = await User.findOne({ email });
        if (!user) throw new NotFoundError('User not found');
        if (user.isVerified) throw new ConflictError('Already verified');

        const coolDown = 60 * 1000; // 1 minute
        if (user.verificationExpiry && user.verificationExpiry.getTime() - 9 * 60 * 1000 > Date.now() - coolDown) {
            throw new ConflictError('Please wait 1 minute before requesting a new code');
        }

        const { code, expiry } = generateVerificationCodeAndExpiry();

        user.verificationCode = code;
        user.verificationExpiry = expiry;
        await user.save();

        await sendVerificationEmail(user.email, code);

        return res.json(ApiResponse.success(null, { message: 'Code resent successfully' }));
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
        const file = req.file as Express.Multer.File;
        const newImage = file?.path;

        if (body.email) {
            const userExists = await User.findOne({ email: body.email });
            if (userExists) throw new ConflictError("This email already exists");
        }

        if (body.password) body.password = await bcrypt.hash(body.password, 10);

        if (newImage) {
            const existedUser = await User.findById(userId);
            if (existedUser?.avatar) {
                const publicId = extractPublicId(existedUser.avatar);
                await cloudinary.uploader.destroy(publicId);
            }
        }

        const newUser = await User.findByIdAndUpdate(
            userId,
            { ...body, ...(newImage && { avatar: newImage }), updatedAt: new Date() },
            { returnDocument: 'after' }
        );

        if (!newUser) throw new NotFoundError("User not found");

        const { password, ...safeUser } = newUser.toObject();
        return res.status(200).json(ApiResponse.success(safeUser));
    }
}

export default AuthController;
