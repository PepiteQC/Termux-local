"use client";

import { useState } from "react";

export type EmoteType = "wave" | "dance" | "blow-kiss" | "laugh" | "sit";

interface EmotePickerProps {
  onEmote: (emote: EmoteType) => void;
  disabled?: boolean;
}

const EMOTES: Array<{ id: EmoteType; label: string; emoji: string; duration: number }> = [
  { id: "wave", label: "Wave", emoji: "👋", duration: 1000 },
  { id: "dance", label: "Dance", emoji: "💃", duration: 2000 },
  { id: "blow-kiss", label: "Blow Kiss", emoji: "😘", duration: 800 },
  { id: "laugh", label: "Laugh", emoji: "😄", duration: 1500 },
  { id: "sit", label: "Sit", emoji: "🪑", duration: 2000 },
];

export function EmotePicker({ onEmote, disabled = false }: EmotePickerProps) {
  const [selectedEmote, setSelectedEmote] = useState<EmoteType | null>(null);

  const handleEmote = (emoteId: EmoteType) => {
    setSelectedEmote(emoteId);
    onEmote(emoteId);

    // Clear selection after emote duration
    const emoteDuration = EMOTES.find((e) => e.id === emoteId)?.duration || 1000;
    setTimeout(() => setSelectedEmote(null), emoteDuration);
  };

  return (
    <div className="emote-picker-container">
      <div className="emote-picker-header">Emotes</div>
      <div className="emote-picker-grid">
        {EMOTES.map((emote) => (
          <button
            key={emote.id}
            onClick={() => handleEmote(emote.id)}
            disabled={disabled}
            className={`emote-button ${selectedEmote === emote.id ? "active" : ""}`}
            title={emote.label}
            aria-label={emote.label}
          >
            <span className="emote-emoji">{emote.emoji}</span>
            <span className="emote-label">{emote.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
