"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseDb } from "@/lib/firebase/client";
import { initializeRoomService, getRoomService, type RoomData } from "@/lib/rooms/RoomService";

export default function NavigatorPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const db = getFirebaseDb();
        if (!db) {
          setError("Firebase not initialized");
          return;
        }

        initializeRoomService(db);
        const roomService = getRoomService();
        const publicRooms = await roomService.listPublicRooms(20);
        setRooms(publicRooms);
      } catch (err) {
        console.error("Failed to load rooms:", err);
        setError("Failed to load rooms");
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, []);

  const handleEnterRoom = (roomId: string) => {
    router.push(`/room?id=${roomId}`);
  };

  const handleCreateRoom = () => {
    // TODO: Implement room creation
    alert("Room creation coming soon!");
  };

  return (
    <div className="navigator-page">
      <div className="navigator-container">
        {/* Header */}
        <div className="navigator-header">
          <h1>🏠 Navigator</h1>
          <button onClick={() => router.back()} className="navigator-back-btn">
            ← Back
          </button>
        </div>

        {/* Tabs */}
        <div className="navigator-tabs">
          <button className="navigator-tab active">Public Rooms</button>
          <button className="navigator-tab">My Rooms</button>
          <button onClick={handleCreateRoom} className="navigator-create-btn">
            + Create Room
          </button>
        </div>

        {/* Rooms List */}
        <div className="navigator-content">
          {isLoading ? (
            <div className="navigator-loading">Loading rooms...</div>
          ) : error ? (
            <div className="navigator-error">{error}</div>
          ) : rooms.length === 0 ? (
            <div className="navigator-empty">No public rooms available</div>
          ) : (
            <div className="navigator-rooms-grid">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="navigator-room-card"
                  onClick={() => handleEnterRoom(room.id)}
                >
                  <div className="room-card-header">
                    <h3 className="room-card-name">{room.name}</h3>
                    <span className="room-card-players">
                      👥 {room.playerCount}/{room.maxPlayers}
                    </span>
                  </div>

                  <p className="room-card-description">{room.description}</p>

                  <div className="room-card-owner">
                    By: <strong>{room.ownerName}</strong>
                  </div>

                  <button className="room-card-enter-btn">
                    Enter Room →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
