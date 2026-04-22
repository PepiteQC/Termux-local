export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  createdAt: Date;
  roomId: string;
}
