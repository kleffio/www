export class AppError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends AppError {
  errors?: Record<string, string[]>;

  constructor(message: string = "Validation failed", errors?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export const logError = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.error("Error:", error);
    if (context) {
      console.error("Context:", context);
    }
  }
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const isNotFoundError = (error: unknown): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isUnauthorizedError = (error: unknown): error is UnauthorizedError => {
  return error instanceof UnauthorizedError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const tryCatch = async <T>(
  fn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<[T | null, Error | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    }
    logError(err);
    return [null, err];
  }
};

export const createLoaderError = (message: string, status: number = 500) => {
  throw new Response(message, { status });
};

export const handleApiError = (error: unknown): never => {
  if (error instanceof Response) {
    throw new AppError(error.statusText || "API request failed", error.status);
  }

  if (error instanceof Error) {
    throw new AppError(error.message);
  }

  throw new AppError("An unexpected error occurred");
};
