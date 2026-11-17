import rateLimit from "express-rate-limit";
import { readLimit, writeLimit } from "../args.js";

// Standard 429 response message helper
const createLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: { status: 429, error: message },
  });
};

// 1. Global Limiter: General safeguard across all routes
export const globalLimiter = createLimiter(
  2 * 60 * 1000, // 2 minutes
  300, // 300 requests per 2 min per IP (~150 req/min)
  "Too many requests from this IP, please try again later.",
);


// 2. Write / Mutation Limiter: For order placement, checkout init, reviews
export const writeLimiter = createLimiter(
  1 * 60 * 1000, // 1 minute
  writeLimit, // Max ${writeLimit} write requests per minute per IP
  "Action limit reached. Please wait a moment before trying again.",
);

// 3. Browsing / Read Limiter: Generous for catalog browsing & stock checking
export const readLimiter = createLimiter(
  1 * 60 * 1000, // 1 minute
  readLimit, // Max ${readLimit} reads per minute per IP
  "Browsing limit exceeded. Please slow down.",
);
