import cron from "node-cron";
import { parseArgs } from "node:util";

const options = {
  "read-limit": { type: "string", default: "100" },
  "write-limit": { type: "string", default: "100" },
  "expire-after": { type: "string", default: "1" }, // in days e.g 1 --> 1 day
  "cron-schedule": { type: "string", default: "*/1 * * * *" }, // --> every minute
} as const;

const { values } = parseArgs({ options, allowPositionals: true });

const expireReq = parseInt(values["expire-after"], 10);
if (isNaN(expireReq)) {
  console.error(
    "Error: --expire-after must be a valid integer (e.g., 1, 2, 3).",
  );
  process.exit(1);
}

const readLimit = parseInt(values["read-limit"], 10);
if (isNaN(readLimit)) {
  console.error("Error: --read-limit must be a valid integer (e.g., 1, 2, 3).");
  process.exit(1);
}

const writeLimit = parseInt(values["write-limit"], 10);
if (isNaN(writeLimit)) {
  console.error(
    "Error: --write-limit must be a valid integer (e.g., 1, 2, 3).",
  );
  process.exit(1);
}

const cronSchedule = values["cron-schedule"];
const isValidCron = cron.validate(cronSchedule);

if (!isValidCron) {
  console.error(`Error: Invalid cron schedule format: "${cronSchedule}"`);
  process.exit(1);
}

export { expireReq, readLimit, writeLimit, cronSchedule };
