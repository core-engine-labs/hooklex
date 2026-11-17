import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { globalErrorHandler } from "./middleware/error.js";
import { logger } from "./utils/Logger.js";
import { webhookRouter } from "./routes/webhook.js";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import { globalLimiter } from "./middleware/rateLimiters.js";
import { userRouter } from "./routes/user.js";

dotenv.config();

const app = express();

const CLIENT_ORIGIN = process.env.CLIENT_URL || "http://localhost:3000";
const CLIENT_ORIGIN_2 = "http://frontend:3000";

const allTypeBasedResponseOnlyAllower = express.raw({
  type: (req) => true,
  limit: "10mb",
});
const jsonBasedResponseOnlyAllower = express.json();

const restrictedCors = cors({
  origin: [CLIENT_ORIGIN, CLIENT_ORIGIN_2],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
});

const unrestrictedCors = cors();

// API Routes
app.use("/api/user", restrictedCors, jsonBasedResponseOnlyAllower, userRouter);

app.use(
  "/wh",
  unrestrictedCors,
  allTypeBasedResponseOnlyAllower,
  webhookRouter,
);

app.get("/health", unrestrictedCors, async (req, res) => {
  try {
    await prisma.$connect();
    const collections = await prisma.collection.findMany();
    res.send({
      msg: "reached success",
      data: [...collections],
    });
  } catch (error) {
    res.send({
      msg: `${error}`,
    });
  }
});

// Global middleware handler
app.use(globalErrorHandler);
app.use(globalLimiter);

// Create HTTP Server
const server = http.createServer(app);

// Configure Socket.io with CORS
export const io = new Server(server, {
  cors: {
    origin: [CLIENT_ORIGIN, CLIENT_ORIGIN_2],
    methods: ["GET", "POST"],
  },
  pingTimeout: 30000,
});

io.on("connection", (socket) => {
  logger.info(`⚡ [socket]: User connected (${socket.id})`);
  socket.join("global_room");
  socket.on("disconnect", () => {
    logger.warn(`🔥 [socket]: User disconnected (${socket.id})`);
    socket.leave("global_room");
  });
});

const SERVER_PORT = process.env.SERVER_PORT||5000;

server.listen(SERVER_PORT, () => {
  logger.info(
    `⚡️ [server]: Server is running at http://localhost:${SERVER_PORT}`,
  );
});
