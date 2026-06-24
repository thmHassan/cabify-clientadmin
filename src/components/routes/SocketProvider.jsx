import { createContext, useContext, useEffect, useState, useCallback } from "react";
import initSocket, { disconnectSocket, getSocket } from "../../services/socketConntection";
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
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return null;
    }

    const existingSocket = getSocket();
    if (existingSocket) {
      setSocket(existingSocket);
      setIsConnected(existingSocket.connected);
      return existingSocket;
    }

    const socketInstance = initSocket();
    if (!socketInstance) {
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
    const socketInstance = connectSocket();

    const onReconnect = () => {
      connectSocket();
    };

    window.addEventListener(SOCKET_RECONNECT_EVENT, onReconnect);
    window.addEventListener(SOCKET_DISCONNECT_EVENT, handleSocketDisconnect);

    return () => {
      window.removeEventListener(SOCKET_RECONNECT_EVENT, onReconnect);
      window.removeEventListener(SOCKET_DISCONNECT_EVENT, handleSocketDisconnect);

      if (socketInstance) {
        socketInstance.off("connect");
        socketInstance.off("disconnect");
      }
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