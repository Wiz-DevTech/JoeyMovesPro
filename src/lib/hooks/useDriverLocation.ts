"use client";

import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

interface Location {
  driverId: string;
  jobId: string;
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  status: string;
  timestamp: Date;
}

export function useDriverLocation(jobId: string) {
  const { socket, isConnected } = useSocket();
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join job room
    socket.emit("job:join", jobId);

    // Listen for location updates
    socket.on("location:update", (data: Location) => {
      setLocation(data);
    });

    return () => {
      socket.emit("job:leave", jobId);
      socket.off("location:update");
    };
  }, [socket, isConnected, jobId]);

  return { location, isConnected };
}