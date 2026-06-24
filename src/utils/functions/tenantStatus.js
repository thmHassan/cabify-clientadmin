import {
  FORCE_LOGOUT_REASONS,
  NOTIFICATION_ACTIONS,
} from "../../constants/socketEvents.constant";

export const COMPANY_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

const INACTIVE_COMPANY_MESSAGE_KEY = "company_inactive_message";
export const INACTIVE_COMPANY_MESSAGE = "Company status is inactive.";
export const DEFAULT_DEACTIVATED_MESSAGE = "Company status is inactive.";

export const getTenantStatus = (tenantData) =>
  String(tenantData?.status || "").toLowerCase();

export const isCompanyInactive = (tenantData) =>
  getTenantStatus(tenantData) === COMPANY_STATUS.INACTIVE;

export const shouldForceLogout = (data = {}) => {
  if (!data || typeof data !== "object") return false;

  return (
    data.action === NOTIFICATION_ACTIONS.FORCE_LOGOUT ||
    data.reason === FORCE_LOGOUT_REASONS.COMPANY_INACTIVE ||
    String(data.status || "").toLowerCase() === COMPANY_STATUS.INACTIVE
  );
};

export const setInactiveCompanyMessage = (
  message = INACTIVE_COMPANY_MESSAGE
) => {
  try {
    sessionStorage.setItem(INACTIVE_COMPANY_MESSAGE_KEY, message);
  } catch (error) {
    console.warn("Failed to store inactive company message", error);
  }
};

export const consumeInactiveCompanyMessage = () => {
  try {
    const message = sessionStorage.getItem(INACTIVE_COMPANY_MESSAGE_KEY);
    if (message) {
      sessionStorage.removeItem(INACTIVE_COMPANY_MESSAGE_KEY);
    }
    return message;
  } catch (error) {
    console.warn("Failed to read inactive company message", error);
    return null;
  }
};
