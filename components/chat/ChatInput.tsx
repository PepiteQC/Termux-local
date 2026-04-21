"use client";

import { useState, useRef } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(message);
      setMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="chat-input-container"
      style={{
        position: "fixed",
        bottom: "18px",
        left: "18px",
        right: "18px",
        zIndex: 40,
        maxWidth: "calc(100% - 36px)",
      }}
    >
      <div className="chat-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Say something..."
          maxLength={90}
          disabled={isSending || isLoading}
          className="chat-input-field"
        />
        <button
          type="submit"
          disabled={!message.trim() || isSending || isLoading}
          className="chat-send-button"
        >
          {isSending ? "..." : "Send"}
        </button>
      </div>
      <div className="chat-input-counter">
        {message.length}/90
      </div>
    </form>
  );
}
