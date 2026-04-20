"use client";

import { ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe
} from "firebase/firestore";

import { getFurnitureSpritePath } from "../furniture/FurnitureRegistry";
import type { FurnitureApiRecord, FurniturePlacement } from "../furniture/FurnitureTypes";
import { getFirebaseDb, getFirebaseStorageClient } from "./client";

type PersistFurnitureInput = {
  roomId: string;
  furniture: FurniturePlacement;
};

export async function fetchRoomFurnitures(roomId: string) {
  const response = await fetch(`/api/furniture/${roomId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Unable to load furnitures for room ${roomId}`);
  }

  const payload = (await response.json()) as { furnitures: FurnitureApiRecord[] };
  return payload.furnitures.map(stripRoomId);
}

export async function persistFurniture({ roomId, furniture }: PersistFurnitureInput) {
  const response = await fetch(`/api/furniture/${roomId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(furniture)
  });

  if (!response.ok) {
    throw new Error(`Unable to persist furniture ${furniture.id}`);
  }

  const payload = (await response.json()) as { furniture: FurnitureApiRecord };
  return stripRoomId(payload.furniture);
}

export async function removeFurniture(roomId: string, id: string) {
  const response = await fetch(`/api/furniture/${roomId}?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Unable to delete furniture ${id}`);
  }
}

export function subscribeToRoomFurnitures(
  roomId: string,
  onChange: (furnitures: FurniturePlacement[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const db = getFirebaseDb();
  if (!db) {
    void fetchRoomFurnitures(roomId)
      .then(onChange)
      .catch((error) => onError?.(toError(error)));
    return () => undefined;
  }

  const furnituresRef = collection(db, "rooms", roomId, "furnitures");
  const furnituresQuery = query(
    furnituresRef,
    orderBy("x", "asc"),
    orderBy("z", "asc"),
    orderBy("y", "asc")
  );

  return onSnapshot(
    furnituresQuery,
    (snapshot) => {
      const next = snapshot.docs.map((doc) =>
        stripRoomId({ roomId, ...(doc.data() as FurniturePlacement), id: doc.id })
      );
      onChange(next);
    },
    (error) => onError?.(toError(error))
  );
}

export async function resolveFurnitureSpriteUrl(storagePath: string, type: FurniturePlacement["type"]) {
  const storage = getFirebaseStorageClient();
  if (!storage) {
    return getFurnitureSpritePath(type);
  }

  try {
    return await getDownloadURL(ref(storage, storagePath));
  } catch {
    return getFurnitureSpritePath(type);
  }
}

function stripRoomId(record: FurnitureApiRecord): FurniturePlacement {
  const { roomId: _roomId, ...rest } = record;
  return rest;
}

function toError(error: unknown) {
  return error instanceof Error ? error : new Error("Unknown Firestore error");
}
