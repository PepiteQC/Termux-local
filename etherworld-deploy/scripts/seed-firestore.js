import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function readJson(file) {
  return JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
}

initializeApp({
  credential: cert({
    projectId: env("FIREBASE_PROJECT_ID"),
    clientEmail: env("FIREBASE_CLIENT_EMAIL"),
    privateKey: env("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n")
  })
});

const db = getFirestore();
const collections = {
  avatars: readJson("../data/avatars.json"),
  items: readJson("../data/items.json"),
  furnitures: readJson("../data/furnitures.json"),
  rooms: readJson("../data/rooms.json")
};

for (const [collectionName, entries] of Object.entries(collections)) {
  for (const entry of entries) {
    await db.collection(collectionName).doc(entry.id).set(
      {
        ...entry,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    console.log(`seeded ${collectionName}/${entry.id}`);
  }
}
