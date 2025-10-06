// Modules imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Config
import connectDB from "./config/db.js";
import { errorHandler } from "./utils/errorHandler.js";

// Routes
import userRoutes from "./routes/user.routes.js";
import authRoutes from "./routes/auth.routes.js";
import dangerRoutes from "./routes/dangerRoutes.js";
import downloadRoutes from "./routes/downloads.routes.js";

// Utils
import { getDiskSpaceInfo } from "./utils/diskSpace.js";

// Config Middleware
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;


if (!PORT) {
    throw new Error("PORT is not set");
} 

if (!CLIENT_URL) {
    throw new Error("CLIENT_URL is not set");
}

// Initialize Socket.io
export const io = new SocketIOServer(httpServer, {
    cors: {
        origin: CLIENT_URL,
        credentials: true,
    },
});

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send initial disk space info when client connects
    getDiskSpaceInfo().then((diskInfo) => {
        socket.emit("diskSpace", diskInfo);
    });

    // Handle client requesting disk space update
    socket.on("requestDiskSpace", async () => {
        const diskInfo = await getDiskSpaceInfo();
        socket.emit("diskSpace", diskInfo);
    });

    socket.on("disconnect", () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});

// Cors
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// Rate Limit 
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10000, // 100 requests per 15 minutes
}));

// Morgan 
app.use(morgan("dev")); // dev is the format of the logs

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req, res) => {
    res.json({ success: true, message: "Server is healthy" });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/danger", dangerRoutes);
app.use("/api/downloads", downloadRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

httpServer.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔌 Socket.io is ready for connections`);
});