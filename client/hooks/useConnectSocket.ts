import { socket } from "@/lib/services/socket";
import { useState, useEffect } from "react";

type ConnectionStatus = "disconnected" | "connecting" | "connected";

export function useConnectSocket() {
  const [SocketStatus, setSocketStatus] = useState<ConnectionStatus>(
    socket.connectionStatus,
  );

  useEffect(() => {
    socket.connect();
    const unsubscribe = socket.onStatusChange((newStatus) => {
      setSocketStatus(newStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { status: SocketStatus };
}
