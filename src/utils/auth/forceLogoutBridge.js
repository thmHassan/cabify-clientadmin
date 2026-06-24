import {
  DEFAULT_DEACTIVATED_MESSAGE,
  shouldForceLogout,
} from "../functions/tenantStatus";
import { hardLogoutToLogin } from "../functions/tokenEncryption";
import { disconnectSocket } from "../../services/socketConntection";
import { requestSocketDisconnect } from "../../components/routes/SocketProvider";
import appConfig from "../../components/configs/app.config";
import { SOCKET_EVENTS } from "../../constants/socketEvents.constant";

export const performCompanyInactiveLogout = (
  message = DEFAULT_DEACTIVATED_MESSAGE
) => {
  const logoutMessage = message || DEFAULT_DEACTIVATED_MESSAGE;

  console.info("[auth] performing company force logout:", logoutMessage);

  requestSocketDisconnect();
  disconnectSocket();

  hardLogoutToLogin(logoutMessage, appConfig.unAuthenticatedEntryPath);
};

export const handleCompanyClientForceLogoutPayload = (data = {}) => {
  console.log("[socket] company-client-force-logout received:", {
    event: SOCKET_EVENTS.COMPANY_CLIENT_FORCE_LOGOUT,
    payload: data,
    status: data?.status,
    action: data?.action,
    reason: data?.reason,
    message: data?.message,
  });

  if (!shouldForceLogout(data)) {
    console.warn(
      "[socket] company-client-force-logout ignored — payload did not match logout criteria",
      data
    );
    return;
  }

  performCompanyInactiveLogout(
    data?.message || DEFAULT_DEACTIVATED_MESSAGE
  );
};
