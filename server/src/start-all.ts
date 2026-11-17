import { spawn, execSync } from "node:child_process";
import path from "path";
import { fileURLToPath } from "node:url";
import { cronSchedule, expireReq, readLimit, writeLimit } from "./args.js";

console.log("Running database migrations...");

try {
  // 1. Run migrations synchronously
  execSync(`${process.cwd()}/node_modules/.bin/prisma migrate deploy`, {
    stdio: "inherit",
  });
  console.log("Migrations completed successfully!");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
}

// 2. Resolve absolute paths to prevent executing the parent script recursively
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverPath = path.resolve(__dirname, "server.js");
const workerPath = path.resolve(__dirname, "worker.js");

console.log(
  "Passed args:",
  [
    "--read-limit",
    String(readLimit),
    "--write-limit",
    String(writeLimit),
    "--expire-after",
    String(expireReq),
    "--cron-schedule",
    String(cronSchedule),
  ].join(" "),
);

const serverProcess = spawn(
  process.execPath,
  [
    serverPath,
    "--read-limit",
    String(readLimit),
    "--write-limit",
    String(writeLimit),
    "--expire-after",
    String(expireReq),
  ],
  { stdio: "inherit" },
);

const workerProcess = spawn(
  process.execPath,
  [workerPath, "--cron-schedule", cronSchedule],
  { stdio: "inherit" },
);
// 3. Handle child process exits cleanly
serverProcess.on("exit", (code) => {
  if (code !== 0) console.error(`Server process exited with code ${code}`);
});

workerProcess.on("exit", (code) => {
  if (code !== 0) console.error(`Worker process exited with code ${code}`);
});
