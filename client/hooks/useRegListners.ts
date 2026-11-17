import { socket } from "@/lib/services/socket";
import { callback_Collection_Deleted, callback_Request } from "@/lib/services/socket_listners";
import { useEffect } from "react";

export const useRegListners = () => {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const timer = setTimeout(() => {
      cleanup = socket.on("msg:request", callback_Request);
      cleanup = socket.on("msg:collection_deleted", callback_Collection_Deleted);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, []);
};