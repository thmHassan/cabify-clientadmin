import useForceLogoutListener from "../../utils/hooks/useForceLogoutListener";
import { useSocket } from "./SocketProvider";

const ForceLogoutListener = () => {
  const socket = useSocket();
  useForceLogoutListener(socket);
  return null;
};

export default ForceLogoutListener;
