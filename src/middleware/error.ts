import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';

export const errorHandler = (err: Error, _: Request, res: Response, __: NextFunction) => {
    //* what i throw
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    //* Unknown errors
    console.error('ERROR !!:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong',
        ...(process.env.NODE_ENV === 'DEVELOPMENT' && {
            error: err.message,
            stack: err.stack
        }),
    });
};