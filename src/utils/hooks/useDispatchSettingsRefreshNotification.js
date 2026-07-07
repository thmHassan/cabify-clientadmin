import { useEffect } from "react";
import { SOCKET_EVENTS } from "../../constants/socketEvents.constant";
import { notifyRefreshRequired } from "../notifications/refreshPageNotification";

const useDispatchSettingsRefreshNotification = (socket, onNotification) => {
  useEffect(() => {
    if (!socket || !onNotification) return;

    const handleDispatchSettingsChanged = (data) => {
      const notification = notifyRefreshRequired(data);
      if (notification) {
        onNotification(notification);
      }
    };

    socket.on(SOCKET_EVENTS.DISPATCH_SETTINGS_CHANGED, handleDispatchSettingsChanged);

    return () => {
      socket.off(SOCKET_EVENTS.DISPATCH_SETTINGS_CHANGED, handleDispatchSettingsChanged);
    };
  }, [socket, onNotification]);
};

export default useDispatchSettingsRefreshNotification;