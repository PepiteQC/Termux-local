"use client";

import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import type { ChatMessage } from "@/lib/chat/ChatService";

interface ChatDisplayProps {
  messages: ChatMessage[];
  avatarPositions: Record<string, { x: number; y: number }>;
  canvasRect?: DOMRect;
}

export function ChatDisplay({
  messages,
  avatarPositions,
  canvasRect,
}: ChatDisplayProps) {
  // Group recent messages by user (last message per user)
  const recentMessages = messages.reduce(
    (acc, msg) => {
      const existing = acc.find((m) => m.userId === msg.userId);
      if (!existing) {
        acc.push(msg);
      }
      return acc;
    },
    [] as ChatMessage[]
  );

  // Filter messages that are less than 4 seconds old
  const visibleMessages = recentMessages.filter((msg) => {
    const age = Date.now() - msg.createdAt.getTime();
    return age < 4000;
  });

  return (
    <>
      {visibleMessages.map((msg) => {
        const avatarPos = avatarPositions[msg.userId];
        if (!avatarPos || !canvasRect) return null;

        // Position chat bubble above avatar
        const bubbleX = avatarPos.x + canvasRect.left;
        const bubbleY = avatarPos.y + canvasRect.top - 100;

        return (
          <ChatBubble
            key={`${msg.userId}-${msg.createdAt.getTime()}`}
            message={msg.message}
            x={bubbleX}
            y={bubbleY}
            duration={4000}
          />
        );
      })}
    </>
  );
}
