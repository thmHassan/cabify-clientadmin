import { io } from "socket.io-client";
import appConfig from "../components/configs/app.config";
import { SOCKET_EVENTS } from "../constants/socketEvents.constant";
import { getDecryptedToken, getTenantId } from "../utils/functions/tokenEncryption";
import { handleCompanyInactiveSocketPayload } from "../utils/auth/forceLogoutBridge";

const SOCKET_IO_PATH = "/socket.io";

let socket = null;

const handleCompanyInactiveLogoutEvent = (data = {}) => {
  const tenantId = getTenantId();
  const payloadTenant =
    data.client_id ?? data.database ?? data.tenant_id ?? null;

  console.log("[socket] company-inactive-logout raw event:", {
    payload: data,
    loggedInTenantId: tenantId,
    payloadTenant,
    companyStatus: data?.status,
    action: data?.action,
    reason: data?.reason,
  });

  if (payloadTenant && String(payloadTenant) !== String(tenantId)) {
    console.warn("[socket] ignored company-inactive-logout for other tenant", {
      payloadTenant,
      tenantId,
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
    console.warn("[socket] missing tenantId or token, not connecting");
    return null;
  }

  console.info("[socket] connecting", {
    url: appConfig.backendUrl,
    path: SOCKET_IO_PATH,
    room: `client_${tenantId}`,
    tenantId,
  });

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
