import "dotenv/config";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

import cron from "node-cron";
import {
  processDeletedCollection,
  processDeletedRequests,
  processExpiredRequests,

} from "./lib/corn.js";
import { logger } from "./utils/Logger.js";
import { cronSchedule } from "./args.js";

logger.info("🚀 Background Cron Worker Started...");

// Guard variable to prevent overlapping execution runs
let isJobRunning = false;

// Task runner wrapper with locks and concurrency guards
async function runMaintenanceJobs() {
  if (isJobRunning) {
    logger.warn(
      "[WORKER] Previous maintenance job is still running. Skipping current cycle to prevent overload.",
    );
    return;
  }

  isJobRunning = true;
  const startTime = Date.now();
  logger.info(
    `[WORKER] Running  maintenance at ${new Date().toISOString()}...`,
  );

  try {
    
    await processDeletedCollection();
    
    await processExpiredRequests();

    await processDeletedRequests();

    const duration = Date.now() - startTime;
    logger.info(
      `[WORKER] Maintenance completed successfully in ${duration}ms.`,
    );
  } catch (error) {
    logger.error(
      `[WORKER ERROR] Maintenance execution encountered an error:${error}`,
    );
  } finally {
    isJobRunning = false; // Always release worker lock
  }
}

// Schedule: Runs at minute 0 of every hour EXCEPT hour 22 (22:00 UTC S3 DB Snapshot Window)
const task = cron.schedule(cronSchedule, runMaintenanceJobs);
console.log(`[WORKER] Cron job scheduled with pattern: "${cronSchedule}"`);
// Graceful Shutdown Handlers
const handleShutdown = async (signal: string) => {
  logger.info(
    `[WORKER] Received ${signal}. Shutting down worker process gracefully...`,
  );
  task.stop();

  // Wait briefly if a job is in-flight before exiting
  if (isJobRunning) {
    logger.info(
      "[WORKER] Waiting for in-flight DB transactions to complete...",
    );
    let checks = 0;
    while (isJobRunning && checks < 10) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      checks++;
    }
  }

  logger.info("[WORKER] Worker process terminated safely.");
  process.exit(0);
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
