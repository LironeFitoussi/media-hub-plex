import { io, Socket } from "socket.io-client";

// Get the Socket.io URL and ensure it's properly formatted
const getSocketURL = (): string => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    // Remove trailing slash if present
    return socketUrl.replace(/\/$/, '');
};

const SOCKET_URL = getSocketURL();

let socket: Socket | null = null;

/**
 * Initialize and return the Socket.io connection
 */
export function getSocket(): Socket {
    if (!socket || !socket.connected) {
        console.log(`🔌 Initializing Socket.io connection to: ${SOCKET_URL}`);
        
        socket = io(SOCKET_URL, {
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: Infinity,
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        });

        socket.on("connect", () => {
            console.log("✅ Socket.io connected successfully");
        });

        socket.on("disconnect", (reason) => {
            console.log(`🔌 Socket.io disconnected: ${reason}`);
        });

        socket.on("connect_error", (error) => {
            console.error("❌ Socket.io connection error:", error.message);
        });
    }

    return socket;
}

/**
 * Disconnect the Socket.io connection (only call when truly leaving the app)
 */
export function disconnectSocket(): void {
    if (socket) {
        console.log("🔌 Manually disconnecting socket");
        socket.disconnect();
        socket = null;
    }
}

/**
 * Check if socket is connected
 */
export function isSocketConnected(): boolean {
    return socket?.connected ?? false;
}

/**
 * Remove all listeners for a specific event
 */
export function removeSocketListeners(event: string): void {
    if (socket) {
        socket.off(event);
    }
}

/**
 * Remove all listeners for multiple events
 */
export function removeAllSocketListeners(events: string[]): void {
    if (socket) {
        events.forEach(event => socket?.off(event));
    }
}

