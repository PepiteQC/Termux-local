import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

function env(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    return stats.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

const root = new URL("../public/assets", import.meta.url);
const assetsDir = root.pathname;

initializeApp({
  credential: cert({
    projectId: env("FIREBASE_PROJECT_ID"),
    clientEmail: env("FIREBASE_CLIENT_EMAIL"),
    privateKey: env("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n")
  }),
  storageBucket: env("FIREBASE_STORAGE_BUCKET")
});

const bucket = getStorage().bucket();
const files = walk(assetsDir);

for (const file of files) {
  const destination = relative(assetsDir, file).replaceAll("\\", "/");
  await bucket.upload(file, {
    destination: `etherworld/${destination}`,
    metadata: {
      cacheControl: "public,max-age=3600"
    }
  });
  console.log(`uploaded ${destination}`);
}
