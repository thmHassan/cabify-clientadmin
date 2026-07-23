import { useEffect } from "react";
import { SOCKET_EVENTS } from "../../constants/socketEvents.constant";
import { notifyRefreshRequired } from "../notifications/refreshPageNotification";

const useDispatchSettingsRefreshNotification = (socket, onNotification) => {
  useEffect(() => {
    if (!socket || !onNotification) return;

    const handleCompanySettingsChanged = (data) => {
      const notification = notifyRefreshRequired(data);
      if (notification) {
        onNotification(notification);
      }
    };

    socket.on(SOCKET_EVENTS.COMPANY_SETTINGS_CHANGED, handleCompanySettingsChanged);

    return () => {
      socket.off(SOCKET_EVENTS.COMPANY_SETTINGS_CHANGED, handleCompanySettingsChanged);
    };
  }, [socket, onNotification]);
};

export default useDispatchSettingsRefreshNotification;
