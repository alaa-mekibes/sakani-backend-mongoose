import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors";

const notFoundHandler = (req: Request, _: Response, next: NextFunction) => {
    next(new NotFoundError(`the route ${req.originalUrl} is not found`));
};

export default notFoundHandler;
