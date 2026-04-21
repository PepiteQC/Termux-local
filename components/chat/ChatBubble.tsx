"use client";

import { useEffect, useState } from "react";

interface ChatBubbleProps {
  message: string;
  x: number;
  y: number;
  duration?: number;
}

export function ChatBubble({ message, x, y, duration = 4000 }: ChatBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  // Truncate message to ~90 chars
  const truncated = message.length > 90 ? message.substring(0, 87) + "..." : message;

  return (
    <div
      style={{
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: "none",
        zIndex: 100,
        animation: `fadeOutUp 0.5s ease-out ${duration - 500}ms forwards`,
      }}
      className="chat-bubble"
    >
      <div className="chat-bubble-content">
        {truncated}
      </div>
      <div className="chat-bubble-pointer" />
    </div>
  );
}
