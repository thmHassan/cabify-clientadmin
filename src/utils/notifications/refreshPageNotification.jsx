import toast from "react-hot-toast";
import {
  NOTIFICATION_ACTIONS,
  NOTIFICATION_TYPES,
} from "../../constants/socketEvents.constant";

export const DISPATCH_SETTINGS_REFRESH_MESSAGE =
  "Auto dispatch configuration was changed. Please refresh the page to load the latest settings.";

export const shouldPromptRefresh = (data = {}) =>
  data.action === NOTIFICATION_ACTIONS.REFRESH_PAGE ||
  data.type === NOTIFICATION_TYPES.REFRESH_REQUIRED;

export const createRefreshNotification = (data = {}) => ({
  id: Date.now(),
  ...data,
  type: data.type || NOTIFICATION_TYPES.REFRESH_REQUIRED,
  action: data.action || NOTIFICATION_ACTIONS.REFRESH_PAGE,
  title: data.title || "Dispatch settings updated",
  description:
    data.description ||
    data.message ||
    DISPATCH_SETTINGS_REFRESH_MESSAGE,
  source: data.source || "dispatch_settings",
  timestamp: data.changed_at || data.timestamp || new Date().toISOString(),
  read: false,
});

export const refreshCurrentPage = () => {
  window.location.reload();
};

export const showRefreshPageToast = ({
  title,
  description,
  duration = 12000,
} = {}) => {
  toast.custom(
    (toastInstance) => (
      <div className="flex flex-col gap-3 min-w-[280px] max-w-[360px]">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => toast.dismiss(toastInstance.id)}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              toast.dismiss(toastInstance.id);
              refreshCurrentPage();
            }}
            className="px-3 py-1.5 text-sm font-medium text-white bg-[#1F41BB] rounded-md hover:bg-blue-700"
          >
            Refresh page
          </button>
        </div>
      </div>
    ),
    { duration }
  );
};

export const notifyRefreshRequired = (data = {}) => {
  if (!shouldPromptRefresh(data)) {
    return null;
  }

  const notification = createRefreshNotification(data);

  showRefreshPageToast({
    title: notification.title,
    description: notification.description,
  });

  if (typeof window !== "undefined" && window.Notification?.permission === "granted") {
    new window.Notification(notification.title, {
      body: notification.description,
    });
  }

  return notification;
};
