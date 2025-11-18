import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types/api";

interface UseSocketOptions {
  token: string | null;
  onMessage: (message: Message) => void;
}

export function useSocket({ token, onMessage }: UseSocketOptions) {
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
    socketRef.current = socket;

    return () => {
      socket.off("course_message:new", onMessage);
      socket.disconnect();
    };
  }, [token, onMessage]);

  return socketRef.current;
}
