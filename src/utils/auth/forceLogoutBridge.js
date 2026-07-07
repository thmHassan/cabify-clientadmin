import {
  DEFAULT_DEACTIVATED_MESSAGE,
  shouldForceLogout,
} from "../functions/tenantStatus";
import { hardLogoutToLogin } from "../functions/tokenEncryption";
import { disconnectSocket } from "../../services/socketConntection";
import { requestSocketDisconnect } from "../../components/routes/SocketProvider";
import appConfig from "../../components/configs/app.config";
import {
  NOTIFICATION_ACTIONS,
  SOCKET_EVENTS,
} from "../../constants/socketEvents.constant";

export const performCompanyInactiveLogout = (
  message = DEFAULT_DEACTIVATED_MESSAGE
) => {
  const logoutMessage = message || DEFAULT_DEACTIVATED_MESSAGE;

  console.info("[auth] performing company force logout:", logoutMessage);

  requestSocketDisconnect();
  disconnectSocket();

  hardLogoutToLogin(logoutMessage, appConfig.unAuthenticatedEntryPath);
};

const shouldProcessForceLogout = (data = {}, eventName) => {
  if (shouldForceLogout(data)) return true;

  if (eventName === SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT) {
    return (
      data?.action === NOTIFICATION_ACTIONS.FORCE_LOGOUT ||
      Boolean(data?.message)
    );
  }

  return false;
};

export const handleCompanyClientForceLogoutPayload = (
  data = {},
  eventName = SOCKET_EVENTS.COMPANY_STATUS_CHANGED
) => {
  console.log(`[socket] ${eventName} received:`, {
    event: eventName,
    payload: data,
    status: data?.status,
    new_status: data?.new_status,
    action: data?.action,
    reason: data?.reason,
    message: data?.message,
  });

  if (!shouldProcessForceLogout(data, eventName)) {
    console.warn(
      `[socket] ${eventName} ignored — payload did not match logout criteria`,
      data
    );
    return;
  }

  performCompanyInactiveLogout(
    data?.message || DEFAULT_DEACTIVATED_MESSAGE
  );
};
