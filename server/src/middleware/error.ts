import type { NextFunction, Request, Response } from "express";
import type { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/Logger.js";

export const globalErrorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || undefined;

  // Log only server errors (5xx) with clean, minimal request context
  if (statusCode >= 500) {
    logger.error(
      { 
        err, 
        req: {
          method: req.method,
          url: req.originalUrl,
        } 
      }, 
      message
    );
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    code,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};