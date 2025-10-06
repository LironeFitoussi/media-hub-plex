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
        origin: true,
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

// Cors - Allow CLIENT_URL, LAN IPs, and ngrok URLs
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.CLIENT_URL || "http://localhost:5173",
            "http://localhost:3000", // Local backend
        ];
        
        // Allow any ngrok-free.app subdomain
        const isNgrokUrl = origin && origin.includes('.ngrok-free.app');
        
        // Allow any local network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const isLocalNetwork = origin && (
            origin.includes('://192.168.') || 
            origin.includes('://10.') || 
            origin.includes('://172.')
        );
        
        if (!origin || allowedOrigins.includes(origin) || isNgrokUrl || isLocalNetwork) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔌 Server is accessible on LAN at http://192.168.1.64:${PORT}`);
    console.log(`🔌 Socket.io is ready for connections`);
});