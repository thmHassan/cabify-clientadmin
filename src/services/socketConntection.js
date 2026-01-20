import { io } from "socket.io-client";
import { getDecryptedToken, getTenantId } from "../utils/functions/tokenEncryption";

let socket = null;

const initSocket = () => {
  if (socket) return socket;

  const tenantId = getTenantId();
  const token = getDecryptedToken();

  console.log("Socket database:", tenantId);
  console.log("token===", token);


  if (!tenantId) {
    console.warn("❌Tenant ID not found, socket not connected");
    return null;
  }

  socket = io("wss://backend.cabifyit.com", {
    path: "/socket.io",
    transports: ["polling", "websocket",],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    query: {
      role: "driver",
      driver_id: "1",
      database: tenantId,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`
    }
  });


  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("⚠️ Socket connection error:", error.message);
  });

  return socket;
};

export default initSocket;
