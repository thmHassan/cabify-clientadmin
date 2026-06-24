import {
  DEFAULT_DEACTIVATED_MESSAGE,
  INACTIVE_COMPANY_MESSAGE,
} from "../functions/tenantStatus";
import { hardLogoutToLogin } from "../functions/tokenEncryption";
import { disconnectSocket } from "../../services/socketConntection";
import { requestSocketDisconnect } from "../../components/routes/SocketProvider";
import appConfig from "../../components/configs/app.config";

export const performCompanyInactiveLogout = (
  message = DEFAULT_DEACTIVATED_MESSAGE
) => {
  const logoutMessage = message || INACTIVE_COMPANY_MESSAGE;

  console.info("[auth] performing company inactive logout:", logoutMessage);

  requestSocketDisconnect();
  disconnectSocket();

  hardLogoutToLogin(logoutMessage, appConfig.unAuthenticatedEntryPath);
};

export const handleCompanyInactiveSocketPayload = (data = {}) => {
  const companyStatus = String(data?.status || "").toLowerCase();

  console.log("[socket] company status event received:", {
    event: "company-inactive-logout",
    payload: data,
    status: data?.status,
    companyStatus,
    action: data?.action,
    reason: data?.reason,
    message: data?.message,
  });

  performCompanyInactiveLogout(
    data?.message || INACTIVE_COMPANY_MESSAGE
  );
};
