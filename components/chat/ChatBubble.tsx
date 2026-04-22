"use client";

import { useEffect, useState } from "react";

interface ChatBubbleProps {
  message: string;
  x: number;
  y: number;
  duration?: number;
  author?: string;
  authorColor?: string;
  variant?: "say" | "shout" | "whisper";
}

const MAX_LENGTH = 90;

export function ChatBubble({
  message,
  x,
  y,
  duration = 4000,
  author,
  authorColor,
  variant = "say",
}: ChatBubbleProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const truncated =
    message.length > MAX_LENGTH ? message.slice(0, MAX_LENGTH - 3) + "..." : message;

  return (
    <div
      style={{
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: "none",
        zIndex: 100,
        animation: `ewChatFadeOutUp 0.45s ease-out ${Math.max(0, duration - 450)}ms forwards`,
      }}
      className={`chat-bubble chat-bubble-${variant}`}
    >
      <div className="chat-bubble-content">
        {author ? (
          <span
            className="chat-bubble-author"
            style={authorColor ? { color: authorColor } : undefined}
          >
            {author}:
          </span>
        ) : null}
        <span className="chat-bubble-text">{truncated}</span>
      </div>
      <div className="chat-bubble-pointer" />
    </div>
  );
}
