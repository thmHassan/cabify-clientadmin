import { io } from "socket.io-client";
import appConfig from "../components/configs/app.config";
import { SOCKET_EVENTS } from "../constants/socketEvents.constant";
import {
  getDecryptedToken,
  resolveSocketClientId,
} from "../utils/functions/tokenEncryption";
import { handleCompanyClientForceLogoutPayload } from "../utils/auth/forceLogoutBridge";

const SOCKET_IO_PATH = "/socket.io";

let socket = null;
let activeSocketClientId = null;

const handleCompanyClientForceLogoutEvent = (data = {}) => {
  const tenantId = resolveSocketClientId();
  const payloadClientId = data.client_id ?? null;
  const payloadDatabase = data.database ?? null;
  const payloadTenant =
    payloadClientId ?? payloadDatabase ?? data.tenant_id ?? null;

  console.log("[socket] company-client-force-logout raw event:", {
    payload: data,
    loggedInTenantId: tenantId,
    payloadClientId,
    payloadDatabase,
    payloadTenant,
    companyStatus: data?.status,
    action: data?.action,
    reason: data?.reason,
  });

  if (payloadTenant && String(payloadTenant) !== String(tenantId)) {
    console.warn(
      "[socket] ignored company-client-force-logout — tenant mismatch",
      { payloadTenant, tenantId }
    );
    return;
  }

  if (
    payloadClientId &&
    payloadDatabase &&
    String(payloadClientId) !== String(payloadDatabase)
  ) {
    console.warn(
      "[socket] ignored company-client-force-logout — client_id/database mismatch in payload",
      { payloadClientId, payloadDatabase }
    );
    return;
  }

  handleCompanyClientForceLogoutPayload(data);
};

const registerCompanyClientForceLogoutListener = (socketInstance) => {
  if (!socketInstance) return;

  socketInstance.off(
    SOCKET_EVENTS.COMPANY_CLIENT_FORCE_LOGOUT,
    handleCompanyClientForceLogoutEvent
  );
  socketInstance.on(
    SOCKET_EVENTS.COMPANY_CLIENT_FORCE_LOGOUT,
    handleCompanyClientForceLogoutEvent
  );

  console.info(
    `[socket] registered "${SOCKET_EVENTS.COMPANY_CLIENT_FORCE_LOGOUT}" on socket ${socketInstance.id || "(pending)"}`
  );
};

export const rebindCompanyClientForceLogoutListener = () => {
  registerCompanyClientForceLogoutListener(getSocket());
};

/** @deprecated use rebindCompanyClientForceLogoutListener */
export const rebindCompanyInactiveLogoutListener =
  rebindCompanyClientForceLogoutListener;

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) {
    activeSocketClientId = null;
    return;
  }

  try {
    socket.off(
      SOCKET_EVENTS.COMPANY_CLIENT_FORCE_LOGOUT,
      handleCompanyClientForceLogoutEvent
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
  const tenantId = resolveSocketClientId();
  const token = getDecryptedToken();

  if (!tenantId || !token) {
    console.warn("[socket] missing tenantId or token, not connecting", {
      tenantId,
      hasToken: Boolean(token),
    });
    return null;
  }

  if (socket && activeSocketClientId === tenantId) {
    return socket;
  }

  if (socket) {
    disconnectSocket();
  }

  console.info("[socket] connecting", {
    url: appConfig.backendUrl,
    path: SOCKET_IO_PATH,
    room: `client_${tenantId}`,
    tenantId,
    client_id: tenantId,
    database: tenantId,
  });

  activeSocketClientId = tenantId;

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
      client_id: tenantId,
      database: tenantId,
    },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  socket.on("connect", () => {
    console.info(
      "[socket] connected:",
      socket.id,
      "room client_" + tenantId,
      "via",
      socket.io.engine.transport.name
    );
    registerCompanyClientForceLogoutListener(socket);
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
