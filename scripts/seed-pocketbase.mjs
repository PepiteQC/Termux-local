import fs from "node:fs/promises";
import path from "node:path";

import PocketBase from "pocketbase";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");

const requiredEnv = [
  "NEXT_PUBLIC_POCKETBASE_URL",
  "POCKETBASE_ADMIN_EMAIL",
  "POCKETBASE_ADMIN_PASSWORD"
];

function parseEnvFile(content) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const index = line.indexOf("=");

      if (index === -1) {
        return acc;
      }

      acc[line.slice(0, index).trim()] = line.slice(index + 1).trim();
      return acc;
    }, {});
}

async function loadLocalEnv() {
  try {
    const content = await fs.readFile(envPath, "utf8");
    const parsed = parseEnvFile(content);

    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Optional if variables are already exported.
  }
}

function ensureEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Variables manquantes: ${missing.join(", ")}. Renseigne .env.local avant le seed.`
    );
  }
}

function field(name, type, extra = {}) {
  return {
    hidden: false,
    name,
    presentable: false,
    required: false,
    system: false,
    type,
    ...extra
  };
}

async function authenticateSuperuser(pb) {
  await pb
    .collection("_superusers")
    .authWithPassword(process.env.POCKETBASE_ADMIN_EMAIL, process.env.POCKETBASE_ADMIN_PASSWORD);
}

async function getCollectionMap(pb) {
  const collections = await pb.collections.getFullList();
  return new Map(collections.map((collection) => [collection.name, collection]));
}

async function upsertBaseCollection(pb, collections, payload) {
  const current = collections.get(payload.name);

  if (current) {
    const updated = await pb.collections.update(current.id, {
      ...current,
      name: payload.name,
      type: "base",
      fields: payload.fields
    });
    collections.set(payload.name, updated);
    return updated;
  }

  const created = await pb.collections.create(payload);
  collections.set(payload.name, created);
  return created;
}

async function ensureDemoUser(pb) {
  try {
    return await pb.collection("users").getFirstListItem('email="ether@demo.local"');
  } catch {
    return pb.collection("users").create({
      email: "ether@demo.local",
      password: "etherworld123",
      passwordConfirm: "etherworld123",
      name: "Ether Demo"
    });
  }
}

async function upsertRecord(pb, collectionName, filter, data) {
  try {
    const current = await pb.collection(collectionName).getFirstListItem(filter);
    return pb.collection(collectionName).update(current.id, data);
  } catch {
    return pb.collection(collectionName).create(data);
  }
}

async function resetRoomFurnitures(pb, roomId, ownerId) {
  const existing = await pb.collection("furnitures").getFullList({
    filter: `room="${roomId}"`
  });

  for (const record of existing) {
    await pb.collection("furnitures").delete(record.id);
  }

  const seeds = [
    { type: "crystal", x: 3, y: 2, z: 0, rotation: 0 },
    { type: "bed", x: 8, y: 3, z: 0, rotation: 1 },
    { type: "neon", x: 2, y: 8, z: 0, rotation: 0 }
  ];

  for (const item of seeds) {
    await pb.collection("furnitures").create({
      ...item,
      room: roomId,
      owner: ownerId
    });
  }
}

async function main() {
  await loadLocalEnv();
  ensureEnv();

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL.replace(/\/$/, ""));
  pb.autoCancellation(false);

  await authenticateSuperuser(pb);

  const collections = await getCollectionMap(pb);
  const usersCollection = collections.get("users");

  if (!usersCollection) {
    throw new Error("La collection auth `users` doit exister avant le seed.");
  }

  await upsertBaseCollection(pb, collections, {
    name: "rooms",
    type: "base",
    fields: [
      field("owner", "relation", {
        collectionId: usersCollection.id,
        maxSelect: 1
      }),
      field("name", "text", { required: true }),
      field("settings", "json")
    ]
  });

  await upsertBaseCollection(pb, collections, {
    name: "furnitures",
    type: "base",
    fields: [
      field("type", "select", {
        required: true,
        maxSelect: 1,
        values: ["chair", "table", "bed", "lamp", "crystal", "neon"]
      }),
      field("x", "number", { required: true }),
      field("y", "number", { required: true }),
      field("z", "number", { required: true }),
      field("rotation", "number", { required: true }),
      field("room", "relation", {
        collectionId: collections.get("rooms")?.id,
        maxSelect: 1,
        cascadeDelete: true
      }),
      field("owner", "relation", {
        collectionId: usersCollection.id,
        maxSelect: 1
      })
    ]
  });

  await upsertBaseCollection(pb, collections, {
    name: "inventory",
    type: "base",
    fields: [
      field("user", "relation", {
        collectionId: usersCollection.id,
        maxSelect: 1,
        cascadeDelete: true
      }),
      field("item", "select", {
        required: true,
        maxSelect: 1,
        values: ["chair", "table", "bed", "lamp", "crystal", "neon"]
      }),
      field("quantity", "number", { required: true })
    ]
  });

  await upsertBaseCollection(pb, collections, {
    name: "avatar",
    type: "base",
    fields: [
      field("user", "relation", {
        collectionId: usersCollection.id,
        maxSelect: 1,
        cascadeDelete: true
      }),
      field("x", "number", { required: true }),
      field("y", "number", { required: true }),
      field("direction", "select", {
        maxSelect: 1,
        values: ["north", "east", "south", "west"]
      }),
      field("skin", "select", {
        maxSelect: 1,
        values: ["ether", "crystal", "shadow"]
      })
    ]
  });

  const demoUser = await ensureDemoUser(pb);
  const room = await upsertRecord(pb, "rooms", 'name="Ether Suite Premium"', {
    owner: demoUser.id,
    name: "Ether Suite Premium",
    settings: {
      theme: "ethercristal",
      allowGuests: true,
      ambience: 78
    }
  });

  const inventorySeed = [
    ["chair", 2],
    ["table", 1],
    ["bed", 1],
    ["lamp", 2],
    ["crystal", 2],
    ["neon", 2]
  ];

  for (const [item, quantity] of inventorySeed) {
    await upsertRecord(pb, "inventory", `user="${demoUser.id}" && item="${item}"`, {
      user: demoUser.id,
      item,
      quantity
    });
  }

  await upsertRecord(pb, "avatar", `user="${demoUser.id}"`, {
    user: demoUser.id,
    x: 5,
    y: 8,
    direction: "north",
    skin: "ether"
  });

  await resetRoomFurnitures(pb, room.id, demoUser.id);

  console.log("Seed PocketBase termine.");
  console.log(`Instance: ${pb.baseURL}`);
  console.log("Utilisateur demo: ether@demo.local / etherworld123");
}

main().catch((error) => {
  console.error("Echec du seed PocketBase.");
  console.error(error.message);
  process.exit(1);
});
