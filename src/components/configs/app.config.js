import { SIGN_IN_PATH } from "../../constants/routes.path.constant/auth.route.path.constant";

const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";

const backendUrl = isDevelopment
  ? "http://127.0.0.1:8000"
  : "https://backend.cabifyit.com";

const getAssetUrl = (path) => {
  if (!path) return "";
  if (/^(https?:|data:)/.test(path)) return path;
  return `${backendUrl}/${String(path).replace(/^\//, "")}`;
};

const appConfig = {
  apiPrefix: `${backendUrl}/api`,
  backendUrl,
  backendSocketUrl: `${backendUrl}/socket-api`,
  getAssetUrl,
  authenticatedEntryPath: "/overview",
  unAuthenticatedEntryPath: SIGN_IN_PATH,
  locale: "en",
  enableMock: false,
};

export default appConfig;
