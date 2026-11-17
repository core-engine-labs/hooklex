import { PrismaClient } from "../generated/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "../utils/Logger.js";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["error", "warn"],
});

const BATCH_SIZE = 100;

export async function processExpiredRequests() {
  let totalDeleted = 0;

  while (true) {
    // Process in atomic transactions with SKIP LOCKED
    const deletedInBatch = await prisma.$transaction(async (tx) => {
      // 1. Fetch & lock expired request IDs (utilizes @@index([expire_after, createdAt]))
      const expiredRequests = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "Request"
        WHERE NOW() >= "createdAt" + ("expire_after" * INTERVAL '1 day') AND "isDeleted" = false
        FOR UPDATE SKIP LOCKED
        LIMIT ${BATCH_SIZE};
      `;

      if (expiredRequests.length === 0) return 0;

      const idsToDelete = expiredRequests.map((r) => r.id);

      // 2. Perform chunked raw SQL deletion
      await tx.$executeRaw`
        DELETE FROM "Request"
        WHERE id = ANY(${idsToDelete});
      `;

      return expiredRequests.length;
    });

    if (deletedInBatch === 0) break;
    totalDeleted += deletedInBatch;
  }

  if (totalDeleted > 0) {
    logger.info(
      `[CRON] Successfully purged ${totalDeleted} expired request records.`,
    );
  }
}

export async function processDeletedCollection() {
  let totalDeleted = 0;

  while (true) {
    const deletedInBatch = await prisma.$transaction(async (tx) => {
      // 1. Fetch & lock deleted collection IDs
      const deletedCollections = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "Collection"
        WHERE "isDeleted" = true
        FOR UPDATE SKIP LOCKED
        LIMIT ${BATCH_SIZE};
      `;

      if (deletedCollections.length === 0) return 0;

      const idsToDelete = deletedCollections.map((r) => r.id);

      // 2. Flag or delete related requests
      let updatedRows = 0;
      do {
        const result = await tx.$executeRaw`
          WITH batch AS (
            SELECT ctid 
            FROM "Request"
            WHERE "collectionId" = ANY(${idsToDelete}) 
              AND "isDeleted" = false
            LIMIT 2000
            FOR UPDATE SKIP LOCKED
          )
          UPDATE "Request" r
          SET "isDeleted" = true
          FROM batch
          Where r.ctid = batch.ctid;
        `;
        updatedRows = Number(result);
      } while (updatedRows > 0);

      // 3. Perform chunked raw SQL deletion for the collections
      await tx.$executeRaw`
        DELETE FROM "Collection"
        WHERE id = ANY(${idsToDelete});
      `;

      return deletedCollections.length;
    });

    if (deletedInBatch === 0) break;
    totalDeleted += deletedInBatch;
  }

  if (totalDeleted > 0) {
    logger.info(
      `[CRON] Successfully purged ${totalDeleted} deleted collections records.`,
    );
  }
}

export async function processDeletedRequests() {
  let totalDeleted = 0;

  while (true) {
    // Process in atomic transactions with SKIP LOCKED
    const deletedInBatch = await prisma.$transaction(async (tx) => {
      // 1. Fetch & lock expired request IDs
      const deletedRequests = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "Request"
        WHERE  "isDeleted" = true
        FOR UPDATE SKIP LOCKED
        LIMIT ${BATCH_SIZE};
      `;

      if (deletedRequests.length === 0) return 0;

      const idsToDelete = deletedRequests.map((r) => r.id);

      // 2. Perform chunked raw SQL deletion
      await tx.$executeRaw`
        DELETE FROM "Request"
        WHERE id = ANY(${idsToDelete});
      `;

      return deletedRequests.length;
    });

    if (deletedInBatch === 0) break;
    totalDeleted += deletedInBatch;
  }

  if (totalDeleted > 0) {
    logger.info(
      `[CRON] Successfully purged ${totalDeleted} deleted request records.`,
    );
  }
}
