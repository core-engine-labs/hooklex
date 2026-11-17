import express from "express";
import type { Router, Request, Response } from "express";
import { writeLimiter } from "../middleware/rateLimiters.js";
import { prisma } from "../lib/prisma.js";
import { io } from "../server.js";
import { expireReq } from "../args.js";

export const webhookRouter: Router = express.Router();

webhookRouter.use(writeLimiter);

const ALLOWED_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
  "PURGE",
  "PROPFIND",
  "TRACE",
];

webhookRouter.use((req, res, next) => {
  const incomingMethod = req.method.toUpperCase();

  // Any method not explicitly allowed gets rejected
  if (!ALLOWED_METHODS.includes(incomingMethod)) {
    res.set("Allow", ALLOWED_METHODS.join(", "));
    return res.status(405).json({
      error: "Method Not Allowed",
      message: `The method ${req.method} is not supported on this endpoint.`,
      allowedMethods: ALLOWED_METHODS,
    });
  }

  next();
});

webhookRouter.all("/:token/{*path}", async (req: Request, res: Response) => {
  try {
    const token = req.params.token as string;
    const pathParams = req.params[0] || req.params.path;

    const isReplay = req.query.isReplay === "true";
    const replayedFrom = (req.query.replayedFrom as string) || null;

    const rawPath = Array.isArray(pathParams)
      ? pathParams.join("/")
      : pathParams || "";
    const targetPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

    if (!isReplay && replayedFrom) {
      // source provided but replay flag missing
      return res.status(400).json({
        error:
          "Invalid request: 'replayedFrom' requires 'isReplay' to be true.",
      });
    } else if (isReplay && !replayedFrom) {
      // replay flag set but source missing
      return res.status(400).json({
        error:
          "Invalid request: 'isReplay' requires 'replayedFrom' to be provided.",
      });
    }

    // 1. Fetch Collection
    const collection = await prisma.collection.findFirst({
      where: { token: token, isDeleted: false },
      select: {
        id: true,
      },
    });

    if (!collection) {
      return res
        .status(404)
        .json({ error: "Invalid or inactive webhook token" });
    }

    //2. Extract Payload Details Safely (Supports ALL Content-Types)
    const contentType = (req.headers["content-type"] || "").toLowerCase();

    const isBinaryType =
      contentType.startsWith("image/") ||
      contentType.startsWith("audio/") ||
      contentType.startsWith("video/") ||
      contentType.startsWith("multipart/") ||
      contentType.includes("octet-stream") ||
      contentType.includes("pdf") ||
      contentType.includes("zip") ||
      contentType.includes("gzip");

    let rawBody: string = "";
    let bodySize: number = 0;

    //3. Extract body Details Safely
    if (req.body instanceof Buffer) {
      bodySize = req.body.length; // Exact raw byte size

      // Check raw bytes for 0x00 null bytes directly on the Buffer!
      const hasNullBytes = req.body.includes(0x00);

      if (isBinaryType || hasNullBytes) {
        // Base64 encoding guarantees safe database storage for binary formats
        rawBody = `data:${contentType || "application/octet-stream"};base64,${req.body.toString("base64")}`;
      } else {
        rawBody = req.body.toString("utf-8");
      }
    } else if (typeof req.body === "string") {
      bodySize = Buffer.byteLength(req.body, "utf-8");
      // Check if string contains null bytes OR if the header specifies binary
      if (req.body.includes("\0") || isBinaryType) {
        rawBody = `data:${contentType || "application/octet-stream"};base64,${Buffer.from(req.body).toString("base64")}`;
      } else {
        rawBody = req.body;
      }
    } else if (req.body && typeof req.body === "object") {
      rawBody = JSON.stringify(req.body);
      bodySize = Buffer.byteLength(rawBody, "utf-8");
    } else {
      rawBody = "";
      bodySize = 0;
    }

    const clientIp =
      (req.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";

    // 4. Save Request & Increment User Metrics
    const savedRequest = await prisma.request.create({
      data: {
        collectionId: collection.id,
        method: req.method,
        path: targetPath,
        headers: req.headers as any,
        ip: clientIp,
        contentType,
        query: req.query as any,
        body: rawBody,
        bodySize,
        isReplay,
        replayedFrom,
        expire_after: expireReq, // Expiration in days from CLI args
      },
    });

    //5. WebSocket / Realtime event notification
    const prepareData = {
      data: {
        id: savedRequest.id,
        method: savedRequest.method,
        ip: savedRequest.ip,
        isReplay: savedRequest.isReplay,
      },
      collectionId: savedRequest.collectionId,
    };
    io.to(`global_room`).emit("msg:request", prepareData);

    return res.status(200).json("Webhook processed successfully");
  } catch (error) {
    return res
      .status(500)
      .json("something went wrong plz try in a moment later");
  }
});
