export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 400, code = "APP_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied for this resource") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Requested resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422, "VALIDATION_ERROR");
  }
}

export class DatabaseError extends AppError {
  constructor(message = "A database operation error occurred") {
    super(message, 500, "DATABASE_ERROR");
  }
}

export function handleServerError(error: unknown): { message: string; code: string; status: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  if (error instanceof Error) {
    console.error("[ServerError Exception]:", error);
  } else {
    console.error("[ServerError Unknown]:", error);
  }

  return {
    message: "An unexpected server error occurred. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
    status: 500,
  };
}
