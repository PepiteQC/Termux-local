import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import type { FurnitureApiRecord, FurniturePlacement } from "../../../../lib/furniture/FurnitureTypes";
import { loadRoomLayout } from "../../../../lib/server/gameContent";

type RoomRouteContext = {
  params: Promise<{
    roomId: string;
  }>;
};

function getFirebaseAdminApp(): App | null {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

function serializeFurniture(roomId: string, id: string, raw: Record<string, unknown>): FurnitureApiRecord {
  return {
    roomId,
    id,
    type: String(raw.type) as FurniturePlacement["type"],
    x: Number(raw.x ?? 0),
    y: Number(raw.y ?? 0),
    z: Number(raw.z ?? 0),
    rotation: Number(raw.rotation ?? 0) as FurniturePlacement["rotation"],
    createdAt: normalizeTimestamp(raw.createdAt),
    updatedAt: normalizeTimestamp(raw.updatedAt)
  };
}

export async function GET(_: Request, context: RoomRouteContext) {
  const { roomId } = await context.params;
  const app = getFirebaseAdminApp();
  if (!app) {
    const furnitures = (await loadRoomLayout(roomId)).map((item) => ({
      roomId,
      ...item
    }));
    return NextResponse.json({ furnitures: furnitures satisfies FurnitureApiRecord[] });
  }

  const db = getFirestore(app);
  const snapshot = await db
    .collection("rooms")
    .doc(roomId)
    .collection("furnitures")
    .orderBy("x", "asc")
    .orderBy("z", "asc")
    .orderBy("y", "asc")
    .get();

  const furnitures = snapshot.docs.map((doc) =>
    serializeFurniture(roomId, doc.id, doc.data() as Record<string, unknown>)
  );

  return NextResponse.json({ furnitures });
}

export async function POST(request: Request, context: RoomRouteContext) {
  const { roomId } = await context.params;
  const app = getFirebaseAdminApp();
  const body = (await request.json()) as FurniturePlacement;

  if (!app) {
    const fallback: FurnitureApiRecord = {
      roomId,
      ...body,
      createdAt: body.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return NextResponse.json({ furniture: fallback });
  }

  const db = getFirestore(app);
  const docRef = db.collection("rooms").doc(roomId).collection("furnitures").doc(body.id);
  const existing = await docRef.get();
  await docRef.set(
    {
      type: body.type,
      x: body.x,
      y: body.y,
      z: body.z,
      rotation: body.rotation,
      createdAt: existing.exists ? existing.get("createdAt") : FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  const fresh = await docRef.get();
  return NextResponse.json({
    furniture: serializeFurniture(roomId, fresh.id, fresh.data() as Record<string, unknown>)
  });
}

export async function DELETE(request: Request, context: RoomRouteContext) {
  const { roomId } = await context.params;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing furniture id" }, { status: 400 });
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    return NextResponse.json({ deleted: true, id });
  }

  const db = getFirestore(app);
  await db.collection("rooms").doc(roomId).collection("furnitures").doc(id).delete();

  return NextResponse.json({ deleted: true, id });
}

function normalizeTimestamp(value: unknown) {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (
    typeof value === "object" &&
    value &&
    "toDate" in value &&
    typeof (value as { toDate?: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return undefined;
}
