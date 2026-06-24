import { useCallback, useEffect } from "react";
import { SOCKET_EVENTS } from "../../constants/socketEvents.constant";
import {
  DEFAULT_DEACTIVATED_MESSAGE,
  shouldForceLogout,
} from "../functions/tenantStatus";
import useAuth from "./useAuth";

const FORCE_LOGOUT_EVENTS = [
  SOCKET_EVENTS.COMPANY_INACTIVE_LOGOUT,
  SOCKET_EVENTS.DISPATCHER_FORCED_LOGOUT,
];

const useForceLogoutListener = (socket) => {
  const { forceLogout } = useAuth();

  const handleForceLogout = useCallback(
    (data) => {
      if (!shouldForceLogout(data)) return;

      forceLogout(data?.message || DEFAULT_DEACTIVATED_MESSAGE);
    },
    [forceLogout]
  );

  useEffect(() => {
    if (!socket) return;

    FORCE_LOGOUT_EVENTS.forEach((eventName) => {
      socket.on(eventName, handleForceLogout);
    });

    return () => {
      FORCE_LOGOUT_EVENTS.forEach((eventName) => {
        socket.off(eventName, handleForceLogout);
      });
    };
  }, [socket, handleForceLogout]);
};

export default useForceLogoutListener;
