"use client";

import { useMemo, useState } from "react";
import { saveStoredAvatar } from "@/lib/avatar";

type Gender = "boy" | "girl";

const skinOptions = [
  { id: "light", label: "Clair", color: "#f1c7a3" },
  { id: "tan", label: "Bronzé", color: "#d79b68" },
  { id: "brown", label: "Brun", color: "#9b623f" },
  { id: "dark", label: "Foncé", color: "#6b412b" },
];

const hairOptions = [
  { id: "black", label: "Noir", color: "#1d1d20" },
  { id: "brown", label: "Brun", color: "#6a4124" },
  { id: "blonde", label: "Blond", color: "#d6ae4e" },
  { id: "red", label: "Roux", color: "#b9532b" },
];

const topOptions = [
  { id: "blue", label: "Bleu", color: "#2f80ed" },
  { id: "red", label: "Rouge", color: "#eb5757" },
  { id: "green", label: "Vert", color: "#27ae60" },
  { id: "purple", label: "Violet", color: "#9b51e0" },
];

const bottomOptions = [
  { id: "black", label: "Noir", color: "#23262f" },
  { id: "gray", label: "Gris", color: "#69707d" },
  { id: "navy", label: "Marine", color: "#1f3a5f" },
  { id: "brown", label: "Brun", color: "#6c4b38" },
];

function ChoiceChip({
  active,
  label,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        minHeight: 42,
        padding: "10px 12px",
        borderRadius: 14,
        border: active ? "2px solid #ffd54d" : "1px solid rgba(255,255,255,0.14)",
        background: active ? "rgba(255,213,77,0.12)" : "rgba(9,12,19,0.78)",
        color: "#fff8e2",
        cursor: "pointer",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: color,
          border: "2px solid rgba(255,255,255,0.24)",
          flexShrink: 0,
        }}
      />
      {label}
    </button>
  );
}

function PixelAvatarPreview({
  gender,
  skin,
  hair,
  top,
  bottom,
}: {
  gender: Gender;
  skin: string;
  hair: string;
  top: string;
  bottom: string;
}) {
  const skinColor = skinOptions.find((x) => x.id === skin)?.color ?? "#f1c7a3";
  const hairColor = hairOptions.find((x) => x.id === hair)?.color ?? "#1d1d20";
  const topColor = topOptions.find((x) => x.id === top)?.color ?? "#2f80ed";
  const bottomColor = bottomOptions.find((x) => x.id === bottom)?.color ?? "#23262f";

  return (
    <div style={{ display: "grid", placeItems: "center", minHeight: 250 }}>
      <div
        style={{
          position: "relative",
          width: 96,
          height: 146,
          transform: "scale(2.1)",
          transformOrigin: "center",
          imageRendering: "pixelated",
        }}
      >
        <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 38, height: 8, background: "rgba(0,0,0,0.22)", borderRadius: 999 }} />
        <div style={{ position: "absolute", left: 28, top: 8, width: 38, height: 38, background: skinColor, border: "3px solid #17110d", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 24, top: 0, width: 46, height: gender === "girl" ? 20 : 17, background: hairColor, border: "3px solid #17110d", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 34, top: 20, width: 4, height: 4, background: "#1c1c1e" }} />
        <div style={{ position: "absolute", left: 50, top: 20, width: 4, height: 4, background: "#1c1c1e" }} />
        <div style={{ position: "absolute", left: 26, top: 44, width: 42, height: 44, background: topColor, border: "3px solid #17110d", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 14, top: 49, width: 14, height: 35, background: skinColor, border: "3px solid #17110d", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 66, top: 49, width: 14, height: 35, background: skinColor, border: "3px solid #17110d", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 28, top: 86, width: 17, height: 36, background: bottomColor, border: "3px solid #17110d", boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left: 49, top: 86, width: 17, height: 36, background: bottomColor, border: "3px solid #17110d", boxSizing: "border-box" }} />
      </div>
    </div>
  );
}

export default function AvatarCreatorOverlay({
  onComplete,
}: {
  onComplete: (profile: {
    username: string;
    gender: Gender;
    skin: string;
    hair: string;
    top: string;
    bottom: string;
    figureString: string;
  }) => void;
}) {
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<Gender>("boy");
  const [skin, setSkin] = useState("light");
  const [hair, setHair] = useState("black");
  const [top, setTop] = useState("blue");
  const [bottom, setBottom] = useState("black");

  const figureString = useMemo(
    () => `gender=${gender};skin=${skin};hair=${hair};top=${top};bottom=${bottom}`,
    [gender, skin, hair, top, bottom]
  );

  function handleCreate() {
    if (!username.trim()) return;

    const saved = saveStoredAvatar({
      username: username.trim(),
      gender,
      skin,
      hair,
      top,
      bottom,
    });

    if (saved) onComplete(saved);
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        background: "rgba(5,8,14,0.72)",
        backdropFilter: "blur(10px)",
        padding: 18,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1120,
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 20,
          borderRadius: 28,
          padding: 20,
          background: "linear-gradient(180deg, rgba(15,22,35,0.96), rgba(9,14,24,0.96))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
          color: "#fff",
        }}
      >
        <div
          style={{
            borderRadius: 22,
            padding: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 12, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1.2 }}>
            Aperçu
          </div>
          <PixelAvatarPreview gender={gender} skin={skin} hair={hair} top={top} bottom={bottom} />
          <div
            style={{
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.05)",
              fontSize: 12,
              color: "#f7e8b2",
              wordBreak: "break-word",
            }}
          >
            {figureString}
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <div style={{ fontSize: 34, fontWeight: 900, color: "#ffd74c", textTransform: "uppercase" }}>
              Crée ton personnage
            </div>
            <div style={{ opacity: 0.86, marginTop: 6 }}>
              Tu es dans le jeu. Termine ton avatar pour entrer dans le monde.
            </div>
          </div>

          <div
            style={{
              borderRadius: 18,
              padding: 14,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.72, textTransform: "uppercase", marginBottom: 8 }}>
              Nom du personnage
            </div>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              placeholder="Exemple : EtherBoy"
              style={{
                width: "100%",
                height: 52,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                padding: "0 14px",
                fontSize: 16,
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.72, textTransform: "uppercase", marginBottom: 8 }}>Style</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {(["boy", "girl"] as Gender[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGender(value)}
                    style={{
                      height: 44,
                      padding: "0 14px",
                      borderRadius: 14,
                      border: gender === value ? "2px solid #ffd24a" : "1px solid rgba(255,255,255,0.12)",
                      background: gender === value ? "linear-gradient(180deg, #ffd84c 0%, #e7a90d 100%)" : "rgba(255,255,255,0.06)",
                      color: gender === value ? "#211300" : "#fff",
                      fontWeight: 900,
                      cursor: "pointer",
                      textTransform: "uppercase",
                    }}
                  >
                    {value === "boy" ? "Garçon" : "Fille"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.72, textTransform: "uppercase", marginBottom: 8 }}>Peau</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {skinOptions.map((option) => (
                  <ChoiceChip key={option.id} active={skin === option.id} label={option.label} color={option.color} onClick={() => setSkin(option.id)} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.72, textTransform: "uppercase", marginBottom: 8 }}>Cheveux</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {hairOptions.map((option) => (
                  <ChoiceChip key={option.id} active={hair === option.id} label={option.label} color={option.color} onClick={() => setHair(option.id)} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.72, textTransform: "uppercase", marginBottom: 8 }}>Haut</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {topOptions.map((option) => (
                  <ChoiceChip key={option.id} active={top === option.id} label={option.label} color={option.color} onClick={() => setTop(option.id)} />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, opacity: 0.72, textTransform: "uppercase", marginBottom: 8 }}>Bas</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {bottomOptions.map((option) => (
                  <ChoiceChip key={option.id} active={bottom === option.id} label={option.label} color={option.color} onClick={() => setBottom(option.id)} />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!username.trim()}
            style={{
              height: 64,
              borderRadius: 18,
              border: "3px solid #724900",
              background: !username.trim()
                ? "linear-gradient(180deg, #ccb065 0%, #8e7341 100%)"
                : "linear-gradient(180deg, #ffd84c 0%, #e7a90d 100%)",
              color: "#211300",
              fontWeight: 900,
              fontSize: 24,
              textTransform: "uppercase",
              cursor: !username.trim() ? "not-allowed" : "pointer",
              boxShadow: "0 8px 0 #8b5f00, 0 18px 30px rgba(0,0,0,0.24)",
            }}
          >
            Créer mon personnage
          </button>
        </div>
      </div>
    </div>
  );
}
