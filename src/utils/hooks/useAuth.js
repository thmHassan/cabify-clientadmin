import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  apiSignIn,
  apiAdminSignIn,
  apiSignOut,
} from "../../services/AuthService";
import {
  setUser,
  signInSuccess,
  signOutSuccess,
  useAppDispatch,
  useAppSelector,
} from "../../store";
import appConfig from "../../components/configs/app.config";
import { REDIRECT_URL_KEY } from "../../constants/app.constant";
import useQuery from "./useQuery";
import {
  storeEncryptedToken,
  removeEncryptedToken,
  clearAllAuthData,
  isAuthenticated,
  getUserDataFromToken,
  getTenantData,
  getTenantId,
  resolveSocketClientId,
  persistTenantSession,
  storeTenantId,
} from "../functions/tokenEncryption";
import {
  INACTIVE_COMPANY_MESSAGE,
  DEFAULT_DEACTIVATED_MESSAGE,
  isCompanyInactive,
  setInactiveCompanyMessage,
} from "../functions/tenantStatus";
import { performCompanyInactiveLogout } from "../auth/forceLogoutBridge";
import { requestSocketReconnect } from "../../components/routes/SocketProvider";

function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const query = useQuery();

  const { token, signedIn } = useAppSelector((state) => state.auth.session);

  const signIn = async (values) => {
    try {
      const resp = await apiSignIn(values);
      if (resp.data) {
        const { token } = resp.data;
        console.log(resp.data.user, "resp.data.user====");
        dispatch(signInSuccess(token));

        // Build user data: prefer explicit user, otherwise derive from tenant_data
        const tenantData = resp.data?.tenant_data || resp.data?.data?.tenant_data || null;
        const tenantId =
          resp.data?.tenant_id ||
          resp.data?.tenantId ||
          resp.data?.data?.tenant_id ||
          resp.data?.data?.tenantId ||
          null;

        const userData = resp.data.user || {
          id: tenantData?.company_id || tenantId || "",
          avatar: tenantData?.picture || "",
          name: tenantData?.company_name || "Anonymous",
          // role: "client",
          email: tenantData?.email || "",
        };

        dispatch(setUser(userData));

        // Persist legacy auth_user for helpers that read from localStorage
        try {
          localStorage.setItem("auth_user", JSON.stringify(userData));
        } catch (e) {
          console.warn("Failed to persist auth_user", e);
        }

        // Persist tenant metadata if present
        try {
          const apiTenantId =
            resp.data?.tenant_id ||
            resp.data?.tenantId ||
            resp.data?.data?.tenant_id ||
            resp.data?.data?.tenantId ||
            null;
          const tenantData =
            resp.data?.tenant_data || resp.data?.data?.tenant_data || null;

          persistTenantSession({ tenantData, tenantId: apiTenantId });
        } catch (e) {
          console.warn("Failed to store tenant metadata", e);
        }

        const redirectUrl = query.get(REDIRECT_URL_KEY);
        navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath);
        requestSocketReconnect();
        return {
          status: "success",
          message: "",
        };
      }
    } catch (errors) {
      return {
        status: "failed",
        message: errors?.response?.data?.message || errors.toString(),
      };
    }
  };

  const adminSignIn = async (values) => {
    try {
      const resp = await apiAdminSignIn(values);
      // Log response for debugging
      console.log("adminSignIn response:", resp);

      // Try to extract token from common response shapes
      const data = resp?.data || {};
      const possibleToken =
        data.access_token || data.token || data.auth_token ||
        data.data?.access_token || data.data?.token || data.data?.auth_token ||
        data.accessToken || data.tokenValue || null;

      // Determine success: prefer explicit success flag, otherwise token presence
      const isSuccess = data.success === 1 || data.success === true || !!possibleToken;

      if (isSuccess) {
        const token = possibleToken;
        const user = data.user || data.data?.user || data.admin || null;
        const tenantData = data.tenant_data || data.data?.tenant_data || null;

        if (isCompanyInactive(tenantData)) {
          clearAllAuthData();
          try {
            localStorage.removeItem("auth_user");
          } catch (e) {
            console.warn("Failed to remove auth_user from localStorage", e);
          }

          setInactiveCompanyMessage(
            data?.message || DEFAULT_DEACTIVATED_MESSAGE
          );

          return {
            status: "failed",
            message:
              data?.message ||
              INACTIVE_COMPANY_MESSAGE ||
              DEFAULT_DEACTIVATED_MESSAGE,
            data,
          };
        }

        if (token) {
          // Store encrypted token in localStorage under 'admin_token'
          storeEncryptedToken(token);

          // Dispatch to Redux store
          dispatch(signInSuccess(token));
        } else {
          // If no token but success, still mark signed in to restore state
          dispatch(signInSuccess("restored"));
        }

        if (user) {
          dispatch(
            setUser({
              avatar: user.avatar || "",
              name: user.name || "Anonymous",
              email: user.email || values.email,
            })
          );
        }

        // Save tenant id (database) for socket room and API headers
        try {
          const apiTenantId =
            data.tenant_id ||
            data.tenantId ||
            data.data?.tenant_id ||
            data.data?.tenantId ||
            null;

          persistTenantSession({ tenantData, tenantId: apiTenantId });
        } catch (e) {
          console.warn("Failed to store tenant metadata", e);
        }

        // Redirect to home page on success
        const redirectUrl = query.get(REDIRECT_URL_KEY);
        navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath);
        requestSocketReconnect();

        return {
          status: "success",
          message: "Login successful",
          token: token || null,
          data,
        };
      }

      return {
        status: "failed",
        message: data?.message || "Login failed",
        data,
      };
    } catch (errors) {
      return {
        status: "failed",
        message: errors?.response?.data?.message || errors.toString(),
      };
    }
  };

  const handleSignOut = useCallback(() => {
    clearAllAuthData();

    try {
      localStorage.removeItem("auth_user");
    } catch (e) {
      console.warn("Failed to remove auth_user from localStorage", e);
    }

    dispatch(signOutSuccess());
    dispatch(
      setUser({
        id: "",
        avatar: "",
        name: "",
        email: "",
      })
    );

    navigate(appConfig.unAuthenticatedEntryPath);
  }, [dispatch, navigate]);

  const logoutInactiveCompany = useCallback((message = INACTIVE_COMPANY_MESSAGE) => {
    performCompanyInactiveLogout(message);
  }, []);

  const forceLogout = logoutInactiveCompany;

  const signOut = () => {
    // Simple logout - just remove token and redirect
    handleSignOut();
  };

  // Clear any legacy admin key and restore auth state on app start
  React.useEffect(() => {
    const legacyAdminData = localStorage.getItem("admin");
    if (legacyAdminData) {
      console.log("Clearing legacy admin data from localStorage");
      localStorage.removeItem("admin");
    }

    // Restore authentication state from encrypted token
    if (isAuthenticated() && !signedIn) {
      const tenantData = getTenantData();
      const clientId = resolveSocketClientId();
      if (clientId && clientId !== getTenantId()) {
        storeTenantId(clientId);
        console.log("[auth] corrected stale tenant_id to socket client id:", clientId);
      }

      if (isCompanyInactive(tenantData)) {
        logoutInactiveCompany();
        return;
      }

      // console.log("Restoring authentication state from encrypted token");
      dispatch(signInSuccess("restored")); // We don't need the actual token in Redux

      // Restore user data from token
      const userData = getUserDataFromToken();
      if (userData) {
        dispatch(setUser(userData));
      }

      requestSocketReconnect();
    }
  }, [dispatch, signedIn, logoutInactiveCompany]);

  return {
    authenticated: isAuthenticated() || (token && signedIn),
    signIn,
    adminSignIn,
    signOut,
    logoutInactiveCompany,
    forceLogout,
  };
}

export default useAuth;