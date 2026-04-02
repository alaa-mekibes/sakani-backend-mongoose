import type { Response } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT for authentication and attaches it as an HTTP-only cookie to the response.
 *
 * @param userId - Unique identifier of the authenticated user
 * @param res - Express response object used to set the authentication cookie
 * @returns The generated JWT string
 */


const generateToken = (userId: string, res: Response) => {
    const payload = { id: userId };
    if (!process.env.JWT_SECRET_KEY) throw new Error('JWT_SECRET_KEY is not defined in environment variables');

    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "30d" });

    res.cookie("jwt", token, {
        httpOnly: true, // ? XSS attacks
        secure: process.env.NODE_ENV === 'PRODUCTION', // ? run in just https
        sameSite: "none", // ? CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return token;
};

export default generateToken;
