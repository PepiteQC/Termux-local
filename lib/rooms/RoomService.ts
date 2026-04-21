import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  Timestamp,
  Firestore,
  DocumentReference,
} from "firebase/firestore";

export interface RoomData {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  playerCount: number;
  maxPlayers: number;
  heightMap: string; // Serialized height map "0000000000..."
}

export interface UserPosition {
  userId: string;
  username: string;
  x: number;
  y: number;
  direction: number; // 0-7
  emote?: string;
  lastUpdated: Date;
}

export class RoomService {
  private db: Firestore;
  private unsubscribes: Array<() => void> = [];

  constructor(db: Firestore) {
    this.db = db;
  }

  /**
   * Create a new room
   */
  async createRoom(
    ownerId: string,
    ownerName: string,
    name: string,
    description: string = ""
  ): Promise<string> {
    try {
      const roomRef = doc(collection(this.db, "rooms"));
      const roomData: Omit<RoomData, "id"> = {
        name,
        ownerId,
        ownerName,
        description,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        playerCount: 0,
        maxPlayers: 50,
        heightMap: "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
      };

      await setDoc(roomRef, roomData);
      return roomRef.id;
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    }
  }

  /**
   * Get room data
   */
  async getRoom(roomId: string): Promise<RoomData | null> {
    try {
      const docSnap = await getDoc(doc(this.db, "rooms", roomId));
      if (!docSnap.exists()) return null;

      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
      } as RoomData;
    } catch (error) {
      console.error("Failed to get room:", error);
      throw error;
    }
  }

  /**
   * List all public rooms
   */
  async listPublicRooms(limit: number = 20): Promise<RoomData[]> {
    try {
      const q = query(
        collection(this.db, "rooms"),
        where("isPublic", "==", true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        }))
        .slice(0, limit) as RoomData[];
    } catch (error) {
      console.error("Failed to list rooms:", error);
      throw error;
    }
  }

  /**
   * Subscribe to user positions in a room (real-time)
   */
  subscribeToUserPositions(
    roomId: string,
    onPositions: (positions: UserPosition[]) => void
  ): () => void {
    const q = query(collection(this.db, "rooms", roomId, "users"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const positions = snapshot.docs.map((doc) => ({
          ...doc.data(),
          userId: doc.id,
          lastUpdated: doc.data().lastUpdated?.toDate?.() || new Date(),
        })) as UserPosition[];

        onPositions(positions);
      },
      (error) => {
        console.error("Failed to subscribe to user positions:", error);
      }
    );

    this.unsubscribes.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Update user position in a room
   */
  async updateUserPosition(
    roomId: string,
    userId: string,
    username: string,
    x: number,
    y: number,
    direction: number
  ): Promise<void> {
    try {
      const userRef = doc(this.db, "rooms", roomId, "users", userId);
      await setDoc(
        userRef,
        {
          username,
          x,
          y,
          direction,
          lastUpdated: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to update user position:", error);
      throw error;
    }
  }

  /**
   * Remove user from room (called on disconnect)
   */
  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, "rooms", roomId, "users", userId));
    } catch (error) {
      console.error("Failed to remove user from room:", error);
      // Don't throw, silent cleanup on disconnect
    }
  }

  /**
   * Update room furniture
   */
  async updateRoomFurniture(
    roomId: string,
    furnitureId: string,
    x: number,
    y: number,
    z: number,
    rotation: number
  ): Promise<void> {
    try {
      const furnitureRef = doc(
        this.db,
        "rooms",
        roomId,
        "furniture",
        furnitureId
      );
      await setDoc(
        furnitureRef,
        {
          x,
          y,
          z,
          rotation,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Failed to update furniture:", error);
      throw error;
    }
  }

  /**
   * Clean up all subscriptions
   */
  unsubscribeAll(): void {
    this.unsubscribes.forEach((unsub) => unsub());
    this.unsubscribes = [];
  }
}

// Singleton instance
let roomServiceInstance: RoomService | null = null;

export function initializeRoomService(db: Firestore): RoomService {
  if (!roomServiceInstance) {
    roomServiceInstance = new RoomService(db);
  }
  return roomServiceInstance;
}

export function getRoomService(): RoomService {
  if (!roomServiceInstance) {
    throw new Error("RoomService not initialized");
  }
  return roomServiceInstance;
}
