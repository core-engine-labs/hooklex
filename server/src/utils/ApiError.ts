export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}