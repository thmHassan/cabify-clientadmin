import { SIGN_IN_PATH } from "../../constants/routes.path.constant/auth.route.path.constant";

const normalizeUrl = (url) => String(url || "").replace(/\/$/, "");

const backendUrl = normalizeUrl(
  import.meta.env.VITE_BACKEND_URL ||
    (import.meta.env.VITE_NODE_ENV === "development"
      ? "http://127.0.0.1:8000"
      : "https://backend.cabifyit.com")
);

const backendSocketUrl = normalizeUrl(
  import.meta.env.VITE_BACKEND_SOCKET_URL || `${backendUrl}/socket-api`
);

const socketIoPath =
  import.meta.env.VITE_SOCKET_IO_PATH || "/socket.io";

// Socket.IO connects to backendUrl with socketIoPath (VITE_SOCKET_IO_PATH).
// backendSocketUrl is for HTTP REST routes under /socket-api.

const getAssetUrl = (path) => {
  if (!path) return "";
  if (/^(https?:|data:)/.test(path)) return path;
  return `${backendUrl}/${String(path).replace(/^\//, "")}`;
};

const appConfig = {
  apiPrefix: `${backendUrl}/api`,
  backendUrl,
  backendSocketUrl,
  socketIoPath,
  getAssetUrl,
  authenticatedEntryPath: "/overview",
  unAuthenticatedEntryPath: SIGN_IN_PATH,
  locale: "en",
  enableMock: false,
};

export default appConfig;
