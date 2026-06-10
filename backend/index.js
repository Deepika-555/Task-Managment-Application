import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use(morgan("dev"));

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/tasks",
  taskRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.get("/", (req, res) => {
  res.send(
    "Task Manager API Running..."
  );
});

const PORT =
  process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});