import { createContext, useContext, useEffect, useState } from "react";
import initSocket from "../../services/socketConntection";


const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [echo, setEcho] = useState(null);

  useEffect(() => {
    const instance = initSocket();
    setEcho(instance);
  }, []);

  if (!echo) {
    return null; // or loader
  }

  return (
    <SocketContext.Provider value={echo}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
