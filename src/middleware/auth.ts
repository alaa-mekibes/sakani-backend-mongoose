import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '../errors';
import { User } from '../models/user';

const authMiddleware = async (req: Request, _: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) throw new UnauthorizedError("Unauthorized, no token provided");

    if (!process.env.JWT_SECRET_KEY) {
        throw new Error("JWT_SECRET_KEY is not configured");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as JwtPayload & { id: string };

        if (!decoded?.id) {
            throw new UnauthorizedError("Invalid token payload");
        }

        const user = await User.findById(decoded.id);

        if (!user) throw new UnauthorizedError("User no longer exists");
        if (!user.isVerified) throw new UnauthorizedError("Please verify your email first");

        req.user = user;
        next();

    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError("Token has expired");
        }
        if (err instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError("Invalid token");
        }

        console.error("Auth middleware error:", err);
        throw err;
    }
};

export default authMiddleware;