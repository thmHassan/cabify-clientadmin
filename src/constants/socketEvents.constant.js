export const SOCKET_EVENTS = {
  SEND_REMINDER: "send-reminder",
  COMPANY_SETTINGS_CHANGED: "company-settings-changed",
  COMPANY_STATUS_CHANGED: "company-status-changed",
  COMPANY_INACTIVE_LOGOUT: "company-inactive-logout",
  DISPATCHER_FORCED_LOGOUT: "dispatcher-forced-logout",
  /** @deprecated use COMPANY_STATUS_CHANGED */
  COMPANY_CLIENT_FORCE_LOGOUT: "company-client-force-logout",
};

export const NOTIFICATION_ACTIONS = {
  REFRESH_PAGE: "refresh_page",
  FORCE_LOGOUT: "force_logout",
};

export const NOTIFICATION_TYPES = {
  REFRESH_REQUIRED: "refresh_required",
};

export const FORCE_LOGOUT_REASONS = {
  COMPANY_INACTIVE: "company_inactive",
};
