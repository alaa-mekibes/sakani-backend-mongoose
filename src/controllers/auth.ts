import type { Request, Response } from "express";
import type { ICreateUserInput, ILoginUserInput, IUpdateUserInput } from "../types/user";
import generateToken from "../utils/generateToken";
import { User } from "../models/user";
import { ConflictError, NotFoundError } from "../errors";
import bcrypt from 'bcryptjs';
import { ApiResponse } from "../utils/apiResponse";
import { Property } from "../models/property";

class AuthController {
    public async registerUser(req: Request, res: Response) {
        const body = req.validated?.body as ICreateUserInput;

        const userExists = await User.findOne({ email: body.email });
        if (userExists) throw new ConflictError("This email is already exists");

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await User.create({ ...body, password: hashedPassword })

        const token = generateToken(user.id, res);

        const { password, ...safeUser } = user.toObject();

        return res.status(201).json(ApiResponse.success(safeUser, { token }));
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
            sameSite: 'strict',
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

    public async getMyProfile(req: Request, res: Response) {
        const userId = req.user!.id;
        const user = await User.findById({ _id: userId });

        if (!user) throw new NotFoundError("the user is not found");

        const { password, ...safeUser } = user.toObject();

        return res.status(200).json(ApiResponse.success(safeUser));
    }

    public async updateMyProfile(req: Request, res: Response) {
        const userId = req.user!.id;
        const body = req.validated as IUpdateUserInput;

        if (body.email) {
            const userExists = await User.findOne({ email: body.email });
            if (userExists) throw new ConflictError("This email is already exists");
        }

        if (body.password) body.password = await bcrypt.hash(body.password, 10);

        const newUser = await User.findByIdAndUpdate(userId, { ...body, updateAt: new Date() }, { returnDocument: 'after' })

        if (!newUser) throw new NotFoundError("the user is not found");

        const { password, ...safeUser } = newUser.toObject();

        return res.status(200).json(ApiResponse.success(safeUser));
    }
}

export default AuthController;