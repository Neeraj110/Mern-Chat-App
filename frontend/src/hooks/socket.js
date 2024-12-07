import { useState, useEffect } from "react";
import io from "socket.io-client";

// Get socket server endpoint from environment variable
const socketEndpoint = import.meta.env.VITE_API_URI || "http://localhost:8000";

export default function useSocket(user) {
  const [socket, setSocket] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const socketInstance = io(socketEndpoint);
    socketInstance.emit("setup", user);

    socketInstance.on("connected", () => {
      setSocket(socketInstance);
      setSocketConnected(true);
    });

    return () => {
      socketInstance.disconnect();
      setSocketConnected(false);
      console.log("Socket disconnected");
    };
  }, [user]);

  return { socket, socketConnected, setSocketConnected };
}
