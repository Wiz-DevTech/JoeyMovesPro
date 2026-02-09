"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

export function useSocket() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    // Initialize socket connection
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      auth: {
        token: session.accessToken, // You'll need to add this to your session
      },
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ WebSocket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [session]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}