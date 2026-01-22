import { createContext, useContext, useEffect, useState } from "react";
import initSocket from "../../services/socketConntection";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = initSocket();

    if (!socketInstance) return;

    const onConnect = () => {
      console.log("✅ Connected in Provider:", socketInstance.id);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log("❌ Disconnected in Provider");
      setIsConnected(false);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);

    setSocket(socketInstance);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      // socketInstance.disconnect(); // optional
    };
  }, []);

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