import express from "express";
import type { Router } from "express";
import { catchAsync } from "../../utils/ApiErrorHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { customAlphabet } from "nanoid";
import { io } from "../../server.js";

export const collectionRouter: Router = express.Router();

async function createReadAbleId(name?: string): Promise<string> {
  const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxys1323545z", 10);
  // Return early if name is missing or empty
  if (!name || typeof name !== "string") {
    return nanoid();
  }

  // TypeScript now knows 'name' is definitely a defined string
  const cleanName: string = name;
  const firstWord = cleanName.trim().split(/\s+/)[0];

  if (!firstWord) {
    return nanoid();
  }

  const base = firstWord.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (!base) {
    return nanoid();
  }

  const uniqueSuffix = nanoid();
  return `${base}_${uniqueSuffix}`;
}

collectionRouter.post(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name) {
      throw new ApiError(400, "Collection name is required");
    }

    const token = await createReadAbleId(name);

    // 3. Create the new collection
    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        token,
      },
      select: {
        id: true,
        name: true,
        description: true,
        token: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json(
      new ApiResponse(201, "Collection created successfully", {
        ...collection,
      }),
    );
  }),
);

collectionRouter.delete(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const collectionId = (req.query.id as string) || req.body.id;

    if (!collectionId) {
      throw new ApiError(400, "Collection ID is required");
    }

    // 1. Check if collection exists and is not already deleted
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        isDeleted: false,
      },
    });

    if (!collection) {
      throw new ApiError(404, "Collection not found");
    }

    // 2. Perform a soft delete by updating the isDeleted flag
    await prisma.collection.update({
      where: { id: collectionId },
      data: { isDeleted: true },
    });

    //3. Perform socket.io event to notify clients about the deletion
    io.to(`global_room`).emit("msg:collection_deleted", {
      collectionId: collectionId,
    });

    // 4. Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, "Collection deleted successfully"));
  }),
);

collectionRouter.get(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    // 1. Fetch limit + 1 items to determine if there's a next page
    const collections = await prisma.collection.findMany({
      where: {
        isDeleted: false,
      },
      take: limit + 1,
      // cursor: points to the last item of the previous page
      // skip: 1 skips the cursor item itself so we start from the next one
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      // Single-field unique sort = stable cursor pagination with no edge cases
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        token: true,
      },
    });

    // 2. Determine pagination status
    const hasMore = collections.length > limit;

    // 3. Keep only 'limit' items for the response
    const pageItems = hasMore ? collections.slice(0, limit) : collections;

    // 4. Set nextCursor to the LAST item of pageItems
    const nextCursor =
      hasMore && pageItems.length > 0
        ? pageItems[pageItems.length - 1]?.id
        : null;

    return res.status(200).json(
      new ApiResponse(200, "Collections retrieved successfully", {
        collections: pageItems,
        nextCursor,
      }),
    );
  }),
);
