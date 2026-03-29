export class AppError extends Error {
    constructor(public statusCode: number, public msg: string, public isOperational: boolean = true) {
        super(msg);
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(msg: string) {
        super(400, msg);
    }
}

export class UnauthorizedError extends AppError {
    constructor(msg: string = 'unauthorized') {
        super(401, msg);
    }
}

export class ForbiddenError extends AppError {
    constructor(msg: string = 'forbidden') {
        super(403, msg);
    }
}

export class NotFoundError extends AppError {
    constructor(msg: string = 'notfound') {
        super(404, msg);
    }
}

export class ConflictError extends AppError {
    constructor(msg: string = 'conflict') {
        super(409, msg);
    }
}