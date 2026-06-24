import { io } from "socket.io-client";
import appConfig from "../components/configs/app.config";
import { SOCKET_EVENTS } from "../constants/socketEvents.constant";
import { getDecryptedToken, getTenantId } from "../utils/functions/tokenEncryption";

let socket = null;
let companyInactiveLogoutHandler = null;

const handleCompanyInactiveLogoutEvent = (data) => {
  console.log("company-inactive-logout received:", data);
  companyInactiveLogoutHandler?.(data);
};

const bindCompanyInactiveLogoutListener = (socketInstance) => {
  if (!socketInstance) return;

  socketInstance.off(
    SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT,
    handleCompanyInactiveLogoutEvent
  );
  socketInstance.on(
    SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT,
    handleCompanyInactiveLogoutEvent
  );
};

export const registerCompanyInactiveLogoutHandler = (handler) => {
  companyInactiveLogoutHandler = handler;

  const currentSocket = getSocket();
  if (currentSocket) {
    bindCompanyInactiveLogoutListener(currentSocket);
  }
};

export const rebindCompanyInactiveLogoutListener = () => {
  const currentSocket = getSocket();
  if (currentSocket && companyInactiveLogoutHandler) {
    bindCompanyInactiveLogoutListener(currentSocket);
  }
};

export const unregisterCompanyInactiveLogoutHandler = () => {
  companyInactiveLogoutHandler = null;

  const currentSocket = getSocket();
  if (currentSocket) {
    currentSocket.off(
      SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT,
      handleCompanyInactiveLogoutEvent
    );
  }
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;

  try {
    socket.off(
      SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT,
      handleCompanyInactiveLogoutEvent
    );
    socket.disconnect();
  } catch (error) {
    console.warn("Failed to disconnect socket:", error);
  } finally {
    socket = null;
  }
};

const initSocket = () => {
  if (socket) return socket;

  const tenantId = getTenantId();
  const token = getDecryptedToken();

  if (!tenantId || !token) {
    console.warn("Tenant ID or auth token not found, socket not connected");
    return null;
  }

  socket = io(appConfig.backendUrl, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    auth: {
      token,
    },
    query: {
      role: "client",
      client_id: tenantId,
      database: tenantId,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    bindCompanyInactiveLogoutListener(socket);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  bindCompanyInactiveLogoutListener(socket);

  return socket;
};

export default initSocket;
