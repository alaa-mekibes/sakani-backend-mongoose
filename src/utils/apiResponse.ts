export class ApiResponse {
    static success<T>(data: T | T[], meta?: Record<string, unknown>, message?: string) {
        return {
            status: 'success' as const,
            data,
            ...meta,
            message,
        };
    }

    static paginated<T>(data: T[], totalCount: number, page: number, limit: number, meta?: Record<string, unknown>) {
        const totalPages = Math.ceil(totalCount / limit);
        return {
            status: 'success' as const,
            data,
            pagination: {
                page, limit, totalCount, totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
            ...meta, // ? additional info
        };
    }

    static fail(
        errors?: { field?: string; message: string }[]
    ) {
        return {
            status: 'fail' as const, // * client error (form)
            errors,
        };
    }

    static error(message = 'Internal server error') {
        return {
            status: 'error' as const, // * server error (Toast)
            message,
        };
    }
}