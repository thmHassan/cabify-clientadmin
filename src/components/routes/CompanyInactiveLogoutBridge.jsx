import { useEffect } from "react";
import useAuth from "../../utils/hooks/useAuth";
import { setForceLogoutHandler } from "../../utils/auth/forceLogoutBridge";

const CompanyInactiveLogoutBridge = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    setForceLogoutHandler(signOut);
    return () => setForceLogoutHandler(null);
  }, [signOut]);

  return null;
};

export default CompanyInactiveLogoutBridge;
