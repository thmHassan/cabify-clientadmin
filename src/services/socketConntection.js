import { io } from "socket.io-client";
import appConfig from "../components/configs/app.config";
import { SOCKET_EVENTS } from "../constants/socketEvents.constant";
import { getDecryptedToken, getTenantId } from "../utils/functions/tokenEncryption";
import { handleCompanyInactiveSocketPayload } from "../utils/auth/forceLogoutBridge";

let socket = null;

const handleCompanyInactiveLogoutEvent = (data) => {
  console.info("[socket] company-inactive-logout event:", data);
  handleCompanyInactiveSocketPayload(data);
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
  console.info(
    `[socket] listening for "${SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT}"`
  );
};

export const rebindCompanyInactiveLogoutListener = () => {
  bindCompanyInactiveLogoutListener(getSocket());
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

  const socketPath =
    import.meta.env.VITE_SOCKET_IO_PATH || "/socket.io";

  // /socket-api/socket.io often supports polling only; websocket upgrade fails on nginx.
  const socketApiPath = socketPath.includes("socket-api");
  const pollingOnly =
    import.meta.env.VITE_SOCKET_TRANSPORT === "polling" || socketApiPath;
  const transports = pollingOnly ? ["polling"] : ["polling", "websocket"];

  console.info("[socket] connecting", {
    url: appConfig.backendUrl,
    path: socketPath,
    transports,
    tenantId,
  });

  socket = io(appConfig.backendUrl, {
    path: socketPath,
    transports,
    upgrade: !pollingOnly,
    rememberUpgrade: false,
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

  socket.io.on("error", (error) => {
    console.warn("[socket] transport error:", error);
  });

  socket.on("connect", () => {
    console.info("[socket] connected:", socket.id, "via", socket.io.engine.transport.name);
    bindCompanyInactiveLogoutListener(socket);
  });

  socket.on("disconnect", (reason) => {
    console.info("[socket] disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[socket] connect_error:", error.message);
  });

  bindCompanyInactiveLogoutListener(socket);

  return socket;
};

export default initSocket;
