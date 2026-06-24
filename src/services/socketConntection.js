import { io } from "socket.io-client";
import appConfig from "../components/configs/app.config";
import { SOCKET_EVENTS } from "../constants/socketEvents.constant";
import {
  getDecryptedToken,
  resolveSocketClientId,
} from "../utils/functions/tokenEncryption";
import { handleCompanyInactiveSocketPayload } from "../utils/auth/forceLogoutBridge";

const SOCKET_IO_PATH = "/socket.io";

let socket = null;
let activeSocketClientId = null;

const handleCompanyInactiveLogoutEvent = (data = {}) => {
  const clientId = resolveSocketClientId();
  const payloadTenant =
    data.client_id ?? data.database ?? data.tenant_id ?? null;

  console.log("[socket] company-inactive-logout raw event:", {
    payload: data,
    loggedInClientId: clientId,
    payloadTenant,
    companyStatus: data?.status,
    action: data?.action,
    reason: data?.reason,
  });

  if (payloadTenant && String(payloadTenant) !== String(clientId)) {
    console.warn("[socket] ignored company-inactive-logout for other tenant", {
      payloadTenant,
      clientId,
    });
    return;
  }

  handleCompanyInactiveSocketPayload(data);
};

const registerCompanyInactiveLogoutListener = (socketInstance) => {
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
    `[socket] registered "${SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT}" on socket ${socketInstance.id || "(pending)"}`
  );
};

export const rebindCompanyInactiveLogoutListener = () => {
  registerCompanyInactiveLogoutListener(getSocket());
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) {
    activeSocketClientId = null;
    return;
  }

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
    activeSocketClientId = null;
  }
};

export const reconnectSocket = () => {
  disconnectSocket();
  return initSocket();
};

const initSocket = () => {
  const clientId = resolveSocketClientId();
  const token = getDecryptedToken();

  if (!clientId || !token) {
    console.warn("[socket] missing clientId or token, not connecting", {
      clientId,
      hasToken: Boolean(token),
    });
    return null;
  }

  if (socket && activeSocketClientId === clientId) {
    return socket;
  }

  if (socket) {
    disconnectSocket();
  }

  console.info("[socket] connecting", {
    url: appConfig.backendUrl,
    path: SOCKET_IO_PATH,
    room: `client_${clientId}`,
    clientId,
    company_id: clientId,
  });

  activeSocketClientId = clientId;

  socket = io(appConfig.backendUrl, {
    path: SOCKET_IO_PATH,
    transports: ["polling", "websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    auth: {
      token,
    },
    query: {
      role: "client",
      client_id: clientId,
      database: clientId,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  socket.on("connect", () => {
    console.info(
      "[socket] connected:",
      socket.id,
      "room client_" + clientId,
      "via",
      socket.io.engine.transport.name
    );
    registerCompanyInactiveLogoutListener(socket);
  });

  socket.on("disconnect", (reason) => {
    console.info("[socket] disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[socket] connect_error:", error.message);
  });

  return socket;
};

export default initSocket;
