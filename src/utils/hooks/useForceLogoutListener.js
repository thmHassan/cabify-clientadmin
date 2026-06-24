import { useEffect } from "react";
import {
  DEFAULT_DEACTIVATED_MESSAGE,
  shouldForceLogout,
} from "../functions/tenantStatus";
import {
  getTenantData,
  storeTenantData,
} from "../functions/tokenEncryption";
import {
  registerCompanyInactiveLogoutHandler,
  unregisterCompanyInactiveLogoutHandler,
} from "../../services/socketConntection";
import useAuth from "./useAuth";

const useForceLogoutListener = () => {
  const { forceLogout } = useAuth();

  useEffect(() => {
    const handleCompanyInactiveLogout = (data = {}) => {
      if (!shouldForceLogout(data)) return;

      const tenantData = getTenantData();
      if (tenantData) {
        storeTenantData({ ...tenantData, status: "inactive" });
      }

      forceLogout(data?.message || DEFAULT_DEACTIVATED_MESSAGE);
    };

    registerCompanyInactiveLogoutHandler(handleCompanyInactiveLogout);

    return () => {
      unregisterCompanyInactiveLogoutHandler();
    };
  }, [forceLogout]);
};

export default useForceLogoutListener;
