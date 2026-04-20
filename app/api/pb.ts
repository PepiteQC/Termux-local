"use client";

import {
  DEFAULT_AVATAR,
  DEFAULT_FURNITURES,
  DEFAULT_INVENTORY,
  DEFAULT_ROOM,
  type AvatarRecord,
  type FurnitureRecord,
  type InventoryItem,
  type RoomRecord
} from "@/lib/iso/types";
import {
  fetchRoomFurnitures,
  persistFurniture,
  removeFurniture,
  subscribeToRoomFurnitures
} from "@/lib/firebase/firestore";

type RoomBundle = {
  room: RoomRecord;
  furnitures: FurnitureRecord[];
  inventory: InventoryItem[];
  avatar: AvatarRecord;
  isAdmin: boolean;
  userId: string;
};

export async function signInDemo() {
  return;
}

export async function fetchRoomBundle(roomId = DEFAULT_ROOM.id): Promise<RoomBundle> {
  try {
    const furnitures = await fetchRoomFurnitures(roomId);

    return {
      room: { ...DEFAULT_ROOM, id: roomId },
      furnitures,
      inventory: DEFAULT_INVENTORY,
      avatar: DEFAULT_AVATAR,
      isAdmin: true,
      userId: "guest"
    };
  } catch {
    return {
      room: { ...DEFAULT_ROOM, id: roomId },
      furnitures: DEFAULT_FURNITURES,
      inventory: DEFAULT_INVENTORY,
      avatar: DEFAULT_AVATAR,
      isAdmin: true,
      userId: "guest"
    };
  }
}

export async function saveAvatarPosition(_: AvatarRecord) {
  return;
}

export async function saveInventory(_: string, __: InventoryItem[]) {
  return;
}

export async function saveFurnitures(roomId: string, furnitures: FurnitureRecord[]) {
  const previousIds = new Set(DEFAULT_FURNITURES.map((item) => item.id));
  const nextIds = new Set(furnitures.map((item) => item.id));

  await Promise.all(
    furnitures.map((item) =>
      persistFurniture({
        roomId,
        furniture: {
          ...item,
          updatedAt: new Date().toISOString()
        }
      })
    )
  );

  await Promise.all(
    [...previousIds]
      .filter((id) => !nextIds.has(id))
      .map((id) => removeFurniture(roomId, id))
  );
}

export async function subscribeToRoom(roomId: string, onChange: () => void) {
  return subscribeToRoomFurnitures(roomId, () => onChange());
}
