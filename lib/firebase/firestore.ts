"use client";

import { ref, getDownloadURL } from "firebase/storage";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Unsubscribe
} from "firebase/firestore";

import { getFurnitureSpritePath } from "../furniture/FurnitureRegistry";
import type { FurnitureApiRecord, FurniturePlacement } from "../furniture/FurnitureTypes";
import { getFirebaseDb, getFirebaseStorageClient } from "./client";

type PersistFurnitureInput = {
  roomId: string;
  furniture: FurniturePlacement;
};

export async function fetchRoomFurnitures(roomId: string): Promise<FurniturePlacement[]> {
  const db = getFirebaseDb();
  if (!db) {
    return [];
  }

  const furnituresRef = collection(db, "rooms", roomId, "furnitures");
  const furnituresQuery = query(
    furnituresRef,
    orderBy("x", "asc"),
    orderBy("z", "asc"),
    orderBy("y", "asc")
  );

  const snapshot = await getDocs(furnituresQuery);
  return snapshot.docs.map((document) =>
    stripRoomId({
      roomId,
      ...(document.data() as FurniturePlacement),
      id: document.id
    })
  );
}

export async function persistFurniture({
  roomId,
  furniture
}: PersistFurnitureInput): Promise<FurniturePlacement> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      ...furniture,
      createdAt: furniture.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  const docRef = doc(db, "rooms", roomId, "furnitures", furniture.id);
  const existing = await getDoc(docRef);
  const existingCreatedAt =
    (existing.exists() ? (existing.data() as DocumentData).createdAt : null) ?? serverTimestamp();

  await setDoc(
    docRef,
    {
      type: furniture.type,
      x: furniture.x,
      y: furniture.y,
      z: furniture.z,
      rotation: furniture.rotation,
      createdAt: existingCreatedAt,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  return {
    ...furniture,
    createdAt: furniture.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export async function removeFurniture(roomId: string, id: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    return;
  }

  await deleteDoc(doc(db, "rooms", roomId, "furnitures", id));
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
