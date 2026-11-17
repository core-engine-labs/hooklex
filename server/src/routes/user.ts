import express from "express";
import type { Router, Request, Response } from "express";
import { collectionRouter } from "./user/collection.js";
import { readLimiter, writeLimiter } from "../middleware/rateLimiters.js";
import { requestRouter } from "./user/request.js";

export const userRouter: Router = express.Router();

userRouter.use(
  "/collection",
  (req, res, next) => {
    // Apply strict limiter ONLY on checkout submission (POST)
    if (req.method === "POST") {
      return writeLimiter(req, res, next);
    }
    return readLimiter(req, res, next);
  },
  collectionRouter,
);

userRouter.use(
  "/request",
  (req, res, next) => {
    // Apply strict limiter ONLY on checkout submission (POST)
    if (req.method === "POST") {
      return writeLimiter(req, res, next);
    }
    return readLimiter(req, res, next);
  },
  requestRouter,
);
