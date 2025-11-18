import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types/api";

interface UseSocketOptions {
  token: string | null;
  onMessage: (message: Message) => void;
  onMessagePinned?: (payload: unknown) => void;
  onMessageUnpinned?: (payload: unknown) => void;
}

export function useSocket({
  token,
  onMessage,
  onMessagePinned,
  onMessageUnpinned,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket = io(
      import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
      {
        auth: { token },
      }
    );

    socket.on("course_message:new", onMessage);
    if (onMessagePinned) {
      socket.on("course_message:pinned", onMessagePinned);
    }
    if (onMessageUnpinned) {
      socket.on("course_message:unpinned", onMessageUnpinned);
    }
    socketRef.current = socket;

    return () => {
      socket.off("course_message:new", onMessage);
      if (onMessagePinned) {
        socket.off("course_message:pinned", onMessagePinned);
      }
      if (onMessageUnpinned) {
        socket.off("course_message:unpinned", onMessageUnpinned);
      }
      socket.disconnect();
    };
  }, [token, onMessage, onMessagePinned, onMessageUnpinned]);

  return socketRef.current;
}
