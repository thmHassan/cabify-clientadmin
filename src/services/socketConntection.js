import { io } from "socket.io-client";
import appConfig from "../components/configs/app.config";
import { SOCKET_EVENTS } from "../constants/socketEvents.constant";
import {
  getDecryptedToken,
  getTenantData,
  resolveDatabaseId,
} from "../utils/functions/tokenEncryption";
import { handleCompanyClientForceLogoutPayload } from "../utils/auth/forceLogoutBridge";

const COMPANY_FORCE_LOGOUT_EVENTS = [
  SOCKET_EVENTS.COMPANY_STATUS_CHANGED,
  SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT,
];

/** Legacy/alternate event names the backend may still emit */
const LEGACY_FORCE_LOGOUT_EVENTS = [
  SOCKET_EVENTS.COMPANY_CLIENT_FORCE_LOGOUT,
  "company_status_changed",
  "companyStatusChanged",
];

const COMPANY_EVENT_PATTERN =
  /company|logout|inactive|force.?logout|status|dispatcher/i;

let socket = null;
let activeSocketClientId = null;
let socketDebugAnyHandler = null;
let socketDebugPacketHandler = null;

export const getSocketDebugSnapshot = () => ({
  hasSocket: Boolean(socket),
  socketId: socket?.id ?? null,
  connected: socket?.connected ?? false,
  socketUrl: appConfig.backendUrl,
  socketIoPath: appConfig.socketIoPath,
  tenantId: resolveDatabaseId(),
  hasToken: Boolean(getDecryptedToken()),
  activeSocketClientId,
  listeningFor: [
    ...COMPANY_FORCE_LOGOUT_EVENTS,
    SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT,
    ...LEGACY_FORCE_LOGOUT_EVENTS,
  ],
});

const isDispatcherFeatureEnabled = () => {
  const value = getTenantData()?.dispatcher;
  return value === "enable" || value === "yes";
};

const isPayloadForCurrentTenant = (data = {}) => {
  const tenantId = resolveDatabaseId();
  const payloadClientId = data.client_id ?? null;
  const payloadDatabase = data.database ?? null;
  const payloadTenant =
    payloadClientId ?? payloadDatabase ?? data.tenant_id ?? null;

  if (!payloadTenant || !tenantId) return true;

  return String(payloadTenant) === String(tenantId);
};

const handleCompanyForceLogoutEvent = (eventName) => (data = {}) => {
  console.log(`[socket] ${eventName} raw event:`, {
    payload: data,
    loggedInTenantId: resolveDatabaseId(),
    companyStatus: data?.status,
    action: data?.action,
    reason: data?.reason,
    new_status: data?.new_status,
  });

  if (!isPayloadForCurrentTenant(data)) {
    console.warn(`[socket] ignored ${eventName} — tenant mismatch`, {
      payloadTenant:
        data.client_id ?? data.database ?? data.tenant_id ?? null,
      tenantId: resolveDatabaseId(),
    });
    return;
  }

  handleCompanyClientForceLogoutPayload(data, eventName);
};

const handleDispatcherForcedLogoutEvent = (data = {}) => {
  console.log(`[socket] ${SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT} raw event:`, {
    payload: data,
    loggedInTenantId: resolveDatabaseId(),
  });

  if (!isPayloadForCurrentTenant(data)) {
    console.warn(
      `[socket] ignored ${SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT} — tenant mismatch`
    );
    return;
  }

  handleCompanyClientForceLogoutPayload(
    data,
    SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT
  );
};

const companyForceLogoutHandlers = COMPANY_FORCE_LOGOUT_EVENTS.reduce(
  (handlers, eventName) => {
    handlers[eventName] = handleCompanyForceLogoutEvent(eventName);
    return handlers;
  },
  {}
);

const legacyForceLogoutHandlers = LEGACY_FORCE_LOGOUT_EVENTS.reduce(
  (handlers, eventName) => {
    handlers[eventName] = (data = {}) => {
      console.warn(
        `[socket:debug] LEGACY event "${eventName}" received from backend — forwarding to force-logout handler`,
        { payload: data, tenantId: resolveDatabaseId() }
      );
      handleCompanyForceLogoutEvent(eventName)(data);
    };
    return handlers;
  },
  {}
);

const isCompanyRelatedPayload = (payload) => {
  if (!payload || typeof payload !== "object") return false;

  return (
    payload.reason === "company_inactive" ||
    payload.action === "force_logout" ||
    payload.type === "force_logout" ||
    String(payload.new_status || "").toLowerCase() === "inactive" ||
    String(payload.status || "").toLowerCase() === "inactive"
  );
};

const registerSocketDebugListener = (socketInstance) => {
  if (!socketInstance) return;

  if (!socketDebugAnyHandler) {
    socketDebugAnyHandler = (eventName, ...args) => {
      const payload = args[0];
      const isCompanyEvent =
        COMPANY_EVENT_PATTERN.test(eventName) ||
        isCompanyRelatedPayload(payload);

      if (isCompanyEvent) {
        console.warn(
          "[socket:debug] >>> BACKEND EMITTED company-related event:",
          {
            eventName,
            payload,
            socketId: socketInstance.id,
            tenantId: resolveDatabaseId(),
            at: new Date().toISOString(),
            listeningFor: [
              ...COMPANY_FORCE_LOGOUT_EVENTS,
              SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT,
              ...LEGACY_FORCE_LOGOUT_EVENTS,
            ],
          }
        );
        return;
      }

      console.warn("[socket:debug] incoming event:", eventName, payload);
    };

    socketInstance.onAny(socketDebugAnyHandler);
  }

  if (!socketDebugPacketHandler && socketInstance.io) {
    socketDebugPacketHandler = (packet) => {
      if (packet?.type === "event") {
        console.warn("[socket:debug] raw engine packet (event):", {
          eventName: packet.data?.[0],
          payload: packet.data?.[1],
          socketId: socketInstance.id,
        });
      }
    };

    socketInstance.io.on("packet", socketDebugPacketHandler);
  }

  console.warn(
    "[socket:debug] listeners active — deactivate company to test; run window.__CABIFY_SOCKET__.status() anytime",
    getSocketDebugSnapshot()
  );
};

const unregisterSocketDebugListener = (socketInstance) => {
  if (!socketInstance) return;

  if (socketDebugAnyHandler) {
    socketInstance.offAny(socketDebugAnyHandler);
    socketDebugAnyHandler = null;
  }

  if (socketDebugPacketHandler && socketInstance.io) {
    socketInstance.io.off("packet", socketDebugPacketHandler);
    socketDebugPacketHandler = null;
  }
};

const registerForceLogoutListeners = (socketInstance) => {
  if (!socketInstance) return;

  COMPANY_FORCE_LOGOUT_EVENTS.forEach((eventName) => {
    socketInstance.off(eventName, companyForceLogoutHandlers[eventName]);
    socketInstance.on(eventName, companyForceLogoutHandlers[eventName]);
  });

  LEGACY_FORCE_LOGOUT_EVENTS.forEach((eventName) => {
    socketInstance.off(eventName, legacyForceLogoutHandlers[eventName]);
    socketInstance.on(eventName, legacyForceLogoutHandlers[eventName]);
  });

  socketInstance.off(
    SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT,
    handleDispatcherForcedLogoutEvent
  );

  if (isDispatcherFeatureEnabled()) {
    socketInstance.on(
      SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT,
      handleDispatcherForcedLogoutEvent
    );
  }

  registerSocketDebugListener(socketInstance);

  console.info(
    `[socket] registered force-logout listeners on socket ${socketInstance.id || "(pending)"}`,
    {
      companyEvents: COMPANY_FORCE_LOGOUT_EVENTS,
      legacyEvents: LEGACY_FORCE_LOGOUT_EVENTS,
      dispatcher: isDispatcherFeatureEnabled(),
    }
  );
};

export const rebindForceLogoutListeners = () => {
  registerForceLogoutListeners(getSocket());
};

/** @deprecated use rebindForceLogoutListeners */
export const rebindCompanyClientForceLogoutListener = rebindForceLogoutListeners;

/** @deprecated use rebindForceLogoutListeners */
export const rebindCompanyInactiveLogoutListener = rebindForceLogoutListeners;

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) {
    activeSocketClientId = null;
    return;
  }

  try {
    COMPANY_FORCE_LOGOUT_EVENTS.forEach((eventName) => {
      socket.off(eventName, companyForceLogoutHandlers[eventName]);
    });
    LEGACY_FORCE_LOGOUT_EVENTS.forEach((eventName) => {
      socket.off(eventName, legacyForceLogoutHandlers[eventName]);
    });
    socket.off(
      SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT,
      handleDispatcherForcedLogoutEvent
    );
    unregisterSocketDebugListener(socket);
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
  const tenantId = resolveDatabaseId();
  const token = getDecryptedToken();

  if (!tenantId || !token) {
    console.warn("[socket] NOT CONNECTING — missing tenantId or token", {
      tenantId,
      hasToken: Boolean(token),
    });
    return null;
  }

  if (socket && activeSocketClientId === tenantId) {
    console.warn("[socket:debug] reusing existing socket", {
      socketId: socket.id,
      connected: socket.connected,
      tenantId,
    });
    return socket;
  }

  if (socket) {
    disconnectSocket();
  }

  console.warn("[socket] CONNECTING...", {
    url: appConfig.backendUrl,
    path: appConfig.socketIoPath,
    room: `client_${tenantId}`,
    tenantId,
    client_id: tenantId,
    database: tenantId,
    role: "client",
  });

  activeSocketClientId = tenantId;

  socket = io(appConfig.backendUrl, {
    path: appConfig.socketIoPath,
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

  // Register listeners before connect so none are missed on fast reconnects
  registerForceLogoutListeners(socket);

  socket.on("connect", () => {
    console.warn(
      "[socket] CONNECTED ✓",
      {
        socketId: socket.id,
        room: `client_${tenantId}`,
        transport: socket.io.engine.transport.name,
      }
    );
    console.warn(
      "[socket:debug] Waiting for backend events. Deactivate company now — if nothing logs, backend is NOT emitting to this client."
    );
    registerForceLogoutListeners(socket);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[socket] DISCONNECTED:", reason);
  });

  socket.on("connect_error", (error) => {
    console.warn("[socket] CONNECT ERROR:", error.message, error);
  });

  return socket;
};

const installSocketDebugGlobals = () => {
  if (typeof window === "undefined" || window.__CABIFY_SOCKET__) return;

  window.__CABIFY_SOCKET__ = {
    status: () => {
      const snapshot = getSocketDebugSnapshot();
      console.warn("[socket:debug] current status:", snapshot);
      return snapshot;
    },
    simulateCompanyInactive: () => {
      const tenantId = resolveDatabaseId();
      console.warn(
        "[socket:debug] simulating company-status-changed (frontend-only test)"
      );
      handleCompanyClientForceLogoutPayload(
        {
          title: "Company deactivated",
          message: "Test: company was deactivated (simulated from console).",
          type: "force_logout",
          action: "force_logout",
          reason: "company_inactive",
          status: "inactive",
          previous_status: "active",
          new_status: "inactive",
          token_revoked: true,
          client_id: tenantId,
          changed_at: new Date().toISOString(),
        },
        SOCKET_EVENTS.COMPANY_STATUS_CHANGED
      );
    },
  };

  console.warn(
    "[socket:debug] window.__CABIFY_SOCKET__ ready — try .status() or .simulateCompanyInactive()"
  );
};

installSocketDebugGlobals();

export default initSocket;
