import {
  DEFAULT_DEACTIVATED_MESSAGE,
  setInactiveCompanyMessage,
} from "../functions/tenantStatus";
import {
  clearAllAuthData,
  getTenantData,
  storeTenantData,
} from "../functions/tokenEncryption";
import { disconnectSocket } from "../../services/socketConntection";
import { requestSocketDisconnect } from "../../components/routes/SocketProvider";
import appConfig from "../../components/configs/app.config";

let forceLogoutHandler = null;

export const setForceLogoutHandler = (handler) => {
  forceLogoutHandler = handler;
};

export const performCompanyInactiveLogout = (
  message = DEFAULT_DEACTIVATED_MESSAGE
) => {
  const tenantData = getTenantData();
  if (tenantData) {
    storeTenantData({ ...tenantData, status: "inactive" });
  }

  setInactiveCompanyMessage(message);
  requestSocketDisconnect();
  disconnectSocket();

  if (forceLogoutHandler) {
    forceLogoutHandler(message);
    return;
  }

  clearAllAuthData();
  try {
    localStorage.removeItem("auth_user");
  } catch (error) {
    console.warn("Failed to remove auth_user", error);
  }

  if (window.location.pathname !== appConfig.unAuthenticatedEntryPath) {
    window.location.href = appConfig.unAuthenticatedEntryPath;
  }
};

export const handleCompanyInactiveSocketPayload = (data = {}) => {
  performCompanyInactiveLogout(
    data?.message || DEFAULT_DEACTIVATED_MESSAGE
  );
};
