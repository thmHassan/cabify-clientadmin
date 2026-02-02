import { io } from "socket.io-client";
import { getCompanyId, getDecryptedToken, getTenantId } from "../utils/functions/tokenEncryption";

let socket = null;

const initSocket = () => {
  if (socket) return socket;

  const tenantId = getTenantId();
  const companyId = getCompanyId()
  const token = getDecryptedToken();

  console.log("tenantId:", tenantId);
  console.log("companyId:", tenantId);
  console.log("token===", token);

  if (!tenantId) {
    console.warn("❌Tenant ID not found, socket not connected");
    return null;
  }

  socket = io("https://backend.cabifyit.com", {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    query: {
      role: "client",
      client_id: tenantId,
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