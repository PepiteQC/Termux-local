"use client";

import { useEffect, useRef, useCallback } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/client";
import { initializeRoomService, getRoomService, type UserPosition } from "@/lib/rooms/RoomService";

interface MultiUserSyncProps {
  roomId: string;
  currentUserId: string;
  currentUsername: string;
  onUsersUpdate?: (users: UserPosition[]) => void;
}

export function MultiUserSync({
  roomId,
  currentUserId,
  currentUsername,
  onUsersUpdate,
}: MultiUserSyncProps) {
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const positionUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{
    x: number;
    y: number;
    direction: number;
  } | null>(null);

  // Subscribe to user positions in the room
  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) return;

    initializeRoomService(db);
    const roomService = getRoomService();

    // Subscribe to real-time user positions
    unsubscribeRef.current = roomService.subscribeToUserPositions(
      roomId,
      (positions) => {
        onUsersUpdate?.(positions);
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [roomId, onUsersUpdate]);

  // Update current user position periodically (every 500ms or on change)
  const updateUserPosition = useCallback(
    (x: number, y: number, direction: number) => {
      // Only update if position changed
      if (
        lastPositionRef.current &&
        lastPositionRef.current.x === x &&
        lastPositionRef.current.y === y &&
        lastPositionRef.current.direction === direction
      ) {
        return;
      }

      lastPositionRef.current = { x, y, direction };

      const db = getFirebaseDb();
      if (!db) return;

      initializeRoomService(db);
      const roomService = getRoomService();

      roomService
        .updateUserPosition(roomId, currentUserId, currentUsername, x, y, direction)
        .catch((error) => {
          console.error("Failed to update user position:", error);
        });
    },
    [roomId, currentUserId, currentUsername]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }

      // Remove user from room on disconnect
      const db = getFirebaseDb();
      if (db) {
        initializeRoomService(db);
        const roomService = getRoomService();
        roomService.removeUserFromRoom(roomId, currentUserId).catch(() => {
          // Silent cleanup
        });
      }
    };
  }, [roomId, currentUserId]);

  // Expose update function for external use (from game engine)
  useEffect(() => {
    // Attach to window so game engine can call it
    (window as any).__updateAvatarPosition = updateUserPosition;

    return () => {
      delete (window as any).__updateAvatarPosition;
    };
  }, [updateUserPosition]);

  return null; // This is a hook component, no visual output
}

/**
 * Hook to update user position from game engine
 * Usage: useAvatarPositionSync(x, y, direction)
 */
export function useAvatarPositionSync(x: number, y: number, direction: number) {
  useEffect(() => {
    const updateFunc = (window as any).__updateAvatarPosition;
    if (updateFunc) {
      updateFunc(x, y, direction);
    }
  }, [x, y, direction]);
}
