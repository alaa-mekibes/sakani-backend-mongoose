import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiResponse } from '../utils/apiResponse';

export const validate =
    (schema: z.ZodType, source: 'body' | 'query' | 'params' = 'body') =>
        (req: Request, res: Response, next: NextFunction) => {
            const parsed = schema.safeParse(req[source]);

            if (!parsed.success) {
                return res.status(400).json(
                    ApiResponse.fail(
                        parsed.error.issues.map((issue) => ({
                            field: issue.path.join('.') || 'form',
                            message: issue.message,
                        }))
                    )
                );
            }

            req.validated = { ...req.validated, [source]: parsed.data };
            next();
        };