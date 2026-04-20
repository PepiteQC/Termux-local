import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  appId: string;
};

export class EtherWorldFirebaseManager {
  private app: FirebaseApp;

  constructor(config: FirebaseConfig) {
    this.app = getApps().length ? getApp() : initializeApp(config);
  }

  async uploadJson<T extends Record<string, unknown>>(collection: string, id: string, payload: T) {
    const db = getFirestore(this.app);
    await setDoc(doc(db, collection, id), payload, { merge: true });
  }

  async downloadJson<T>(collection: string, id: string): Promise<T | null> {
    const db = getFirestore(this.app);
    const snapshot = await getDoc(doc(db, collection, id));
    return snapshot.exists() ? (snapshot.data() as T) : null;
  }

  async uploadAsset(path: string, bytes: Blob | Uint8Array | ArrayBuffer) {
    const storage = getStorage(this.app);
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, bytes);
    return getDownloadURL(storageRef);
  }

  encryptJson(payload: unknown, secret: string) {
    const iv = randomBytes(16);
    const key = createHash("sha256").update(secret).digest();
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return {
      iv: iv.toString("hex"),
      value: encrypted.toString("base64")
    };
  }

  decryptJson<T>(payload: { iv: string; value: string }, secret: string): T {
    const iv = Buffer.from(payload.iv, "hex");
    const key = createHash("sha256").update(secret).digest();
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.value, "base64")),
      decipher.final()
    ]);
    return JSON.parse(decrypted.toString("utf8")) as T;
  }
}
