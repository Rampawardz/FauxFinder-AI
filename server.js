import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import reportRoutes from "./routes/reports.js";
import initAlertSocket from "./sockets/alertSocket.js";
import aiAssistantRoute from "./routes/aiAssistant.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://fauxfinder-ai.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initAlertSocket(io);

app.use(
  cors({
    origin: ["http://localhost:3000", "https://fauxfinder-ai.onrender.com"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/ai-assistant", aiAssistantRoute);
app.use("/api/reports", reportRoutes(io));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, "FauxFinder AI")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "FauxFinder AI", "index.html"));
});

app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ message: "Something went wrong" });
});

mongoose.connection.once("open", () => {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () =>
    console.log(`✅ Server running on port ${PORT}`)
  );
});
