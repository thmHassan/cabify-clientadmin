import { createContext, useContext, useEffect, useState, useCallback } from "react";
import initSocket, {
  disconnectSocket,
  getSocket,
  reconnectSocket,
  getSocketDebugSnapshot,
} from "../../services/socketConntection";
import { isAuthenticated } from "../../utils/functions/tokenEncryption";

const SOCKET_RECONNECT_EVENT = "socket:reconnect";
const SOCKET_DISCONNECT_EVENT = "socket:disconnect";

export const requestSocketReconnect = () => {
  window.dispatchEvent(new CustomEvent(SOCKET_RECONNECT_EVENT));
};

export const requestSocketDisconnect = () => {
  window.dispatchEvent(new CustomEvent(SOCKET_DISCONNECT_EVENT));
};

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectSocket = useCallback(() => {
    if (!isAuthenticated()) {
      console.warn("[socket:debug] SocketProvider — not authenticated, skipping connect");
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return null;
    }

    const existingSocket = getSocket();
    if (existingSocket) {
      console.warn("[socket:debug] SocketProvider — reusing socket", {
        socketId: existingSocket.id,
        connected: existingSocket.connected,
      });
      setSocket(existingSocket);
      setIsConnected(existingSocket.connected);
      return existingSocket;
    }

    console.warn("[socket:debug] SocketProvider — calling initSocket()");
    const socketInstance = initSocket();
    if (!socketInstance) {
      console.warn("[socket:debug] SocketProvider — initSocket returned null", getSocketDebugSnapshot());
      setSocket(null);
      setIsConnected(false);
      return null;
    }

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    setSocket(socketInstance);
    setIsConnected(socketInstance.connected);

    return socketInstance;
  }, []);

  const handleSocketDisconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    console.warn("[socket:debug] SocketProvider mounted on", window.location.pathname);
    connectSocket();

    const onReconnect = () => {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);

      const socketInstance = reconnectSocket();
      if (!socketInstance) return;

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      socketInstance.on("connect", onConnect);
      socketInstance.on("disconnect", onDisconnect);
      setSocket(socketInstance);
      setIsConnected(socketInstance.connected);
    };

    window.addEventListener(SOCKET_RECONNECT_EVENT, onReconnect);
    window.addEventListener(SOCKET_DISCONNECT_EVENT, handleSocketDisconnect);

    return () => {
      window.removeEventListener(SOCKET_RECONNECT_EVENT, onReconnect);
      window.removeEventListener(SOCKET_DISCONNECT_EVENT, handleSocketDisconnect);
    };
  }, [connectSocket, handleSocketDisconnect]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context?.socket ?? null;
};

export const useSocketStatus = () => {
  const context = useContext(SocketContext);
  return context?.isConnected ?? false;
};