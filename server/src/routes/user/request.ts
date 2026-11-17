import express from "express";
import type { Router } from "express";
import { catchAsync } from "../../utils/ApiErrorHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { Prisma } from "../../generated/client/client.js";

export const requestRouter: Router = express.Router();

type Filters = {
  method?:
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "HEAD"
    | "OPTIONS"
    | "TRACE"
    | undefined;
  body?: string | undefined;
  header?: string | undefined;
  query?: string | undefined;
  ip?: string | undefined;
  isReplayed?: boolean | undefined;
  collectionId?: string | undefined;
};

requestRouter.get(
  "/",
  catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const cursor = req.query.cursor as string | undefined;
    const search = req.query.search as string | undefined;

    let filters: Filters = {};
    if (req.query.filters) {
      try {
        filters = JSON.parse(atob(req.query.filters as string));
      } catch {
        throw new ApiError(400, "Invalid JSON format for filters");
      }
    }

    const collectionIdParam =
      (req.query.collectionId as string | undefined) || filters.collectionId;

    // Left as-is per your request
    const hasSearchOrFilter =
      Boolean(search?.trim()) ||
      Boolean(filters.method) ||
      Boolean(filters.body?.trim()) ||
      Boolean(filters.header?.trim()) ||
      Boolean(filters.query?.trim()) ||
      Boolean(filters.ip?.trim()) ||
      filters.isReplayed !== undefined;

    if (!hasSearchOrFilter && !collectionIdParam) {
      throw new ApiError(
        400,
        "collectionId query parameter is required when no search or filter is applied",
      );
    }

    let targetCollectionIds: string[] = [];

    if (collectionIdParam) {
      const collection = await prisma.collection.findFirst({
        where: { id: collectionIdParam },
        select: { id: true },
      });

      if (!collection) {
        throw new ApiError(404, "Collection not found");
      }
      targetCollectionIds = [collection.id];
    } else {
      const userCollections = await prisma.collection.findMany({
        select: { id: true },
      });

      if (userCollections.length === 0) {
        return res.status(200).json(
          new ApiResponse(200, "Requests retrieved successfully", {
            requests: [],
            nextCursor: null,
          }),
        );
      }

      targetCollectionIds = userCollections.map((c) => c.id);
    }

    // Build Dynamic Raw SQL Conditions
    const sqlConditions: Prisma.Sql[] = [
      Prisma.sql`"collectionId" = ANY(${targetCollectionIds})`,
    ];

    // 2. Cursor tie-breaking logic (createdAt, id) tuple comparison prevents skipped records
    if (cursor) {
      const cursorRecord = await prisma.request.findUnique({
        where: { id: cursor },
        select: { createdAt: true, id: true },
      });
      if (cursorRecord) {
        sqlConditions.push(
          Prisma.sql`("createdAt", "id") < (${cursorRecord.createdAt}, ${cursorRecord.id})`,
        );
      }
    }

    // Global Text Search Filter across string and JSON fields
    if (search?.trim()) {
      const pattern = `%${search.trim()}%`;
      sqlConditions.push(Prisma.sql`
        (
          "ip" ILIKE ${pattern} OR
          "method" ILIKE ${pattern} OR
          "body" ILIKE ${pattern} OR
          "headers"::text ILIKE ${pattern} OR
          "query"::text ILIKE ${pattern}
        )
      `);
    }

    // Granular Field Filters
    if (filters.method) {
      sqlConditions.push(Prisma.sql`"method" = ${filters.method}`);
    }
    if (filters.ip?.trim()) {
      sqlConditions.push(Prisma.sql`"ip" ILIKE ${`%${filters.ip.trim()}%`}`);
    }
    if (filters.body?.trim()) {
      sqlConditions.push(
        Prisma.sql`"body" ILIKE ${`%${filters.body.trim()}%`}`,
      );
    }
    if (filters.header?.trim()) {
      sqlConditions.push(
        Prisma.sql`"headers"::text ILIKE ${`%${filters.header.trim()}%`}`,
      );
    }
    if (filters.query?.trim()) {
      sqlConditions.push(
        Prisma.sql`"query"::text ILIKE ${`%${filters.query.trim()}%`}`,
      );
    }

    // 3. Fixed boolean check for isReplayed
    if (filters.isReplayed) {
      sqlConditions.push(Prisma.sql`"isReplay" = ${filters.isReplayed}`);
    }


    const whereClause = Prisma.sql`WHERE ${Prisma.join(
      sqlConditions,
      " AND ",
    )}`;

    const fetchedRequests = await prisma.$queryRaw<
      Array<{
        id: string;
        method: string;
        ip: string | null;
        isReplay: boolean;
      }>
    >`
      SELECT 
        "id", 
        "method", 
        "ip", 
        "isReplay" 
      FROM "Request"
      ${whereClause}
      ORDER BY "createdAt" DESC, "id" DESC
      LIMIT ${limit + 1}
    `;

    let calculatedNextCursor: string | null = null;
    if (fetchedRequests.length > limit) {
      const nextItem = fetchedRequests.pop();
      calculatedNextCursor = nextItem?.id || null;
    }

    return res.status(200).json(
      new ApiResponse(200, "Requests retrieved successfully", {
        requests: fetchedRequests,
        nextCursor: calculatedNextCursor,
      }),
    );
  }),
);

requestRouter.get(
  "/:id",
  catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    if (!id) {
      throw new ApiError(400, "Request ID is required");
    }

    const request = await prisma.request.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        collectionId: true,
        method: true,
        path: true,
        headers: true,
        ip: true,
        contentType: true,
        query: true,
        body: true,
        bodySize: true,
        isReplay: true,
        replayedFrom: true,
        createdAt: true,
      },
    });

    if (!request) {
      throw new ApiError(404, "Request not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Request details retrieved successfully", request),
      );
  }),
);
