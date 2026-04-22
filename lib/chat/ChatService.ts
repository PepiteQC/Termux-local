import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  Firestore
} from "firebase/firestore";

export type { ChatMessage } from "./types";
import type { ChatMessage } from "./types";

export class ChatService {
  private db: Firestore;
  private unsubscribes: Array<() => void> = [];

  constructor(db: Firestore) {
    this.db = db;
  }

  /**
   * Send a chat message to a room
   */
  async sendMessage(
    roomId: string,
    userId: string,
    username: string,
    message: string
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, "rooms", roomId, "messages"), {
        userId,
        username,
        message: message.trim(),
        createdAt: Timestamp.now(),
        roomId,
      });
      return docRef.id;
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  /**
   * Subscribe to recent messages in a room
   */
  subscribeToMessages(
    roomId: string,
    onMessages: (messages: ChatMessage[]) => void,
    messageLimit: number = 50
  ): () => void {
    const q = query(
      collection(this.db, "rooms", roomId, "messages"),
      orderBy("createdAt", "desc"),
      limit(messageLimit)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          } as ChatMessage))
          .reverse(); // Show oldest first

        onMessages(messages);
      },
      (error) => {
        console.error("Failed to subscribe to messages:", error);
      }
    );

    this.unsubscribes.push(unsubscribe);
    return unsubscribe;
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
let chatServiceInstance: ChatService | null = null;

export function initializeChatService(db: Firestore): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService(db);
  }
  return chatServiceInstance;
}

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    throw new Error("ChatService not initialized");
  }
  return chatServiceInstance;
}
