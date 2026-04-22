"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
        background: active ? "rgba(255,213,77,0.12)" : "rgba(9,12,19,0.72)",
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
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: 280,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 96,
          height: 146,
          transform: "scale(2.2)",
          transformOrigin: "center",
          imageRendering: "pixelated",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 2,
            left: "50%",
            transform: "translateX(-50%)",
            width: 38,
            height: 8,
            background: "rgba(0,0,0,0.22)",
            borderRadius: 999,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 28,
            top: 8,
            width: 38,
            height: 38,
            background: skinColor,
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 24,
            top: 0,
            width: 46,
            height: gender === "girl" ? 20 : 17,
            background: hairColor,
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />

        <div style={{ position: "absolute", left: 34, top: 20, width: 4, height: 4, background: "#1c1c1e" }} />
        <div style={{ position: "absolute", left: 50, top: 20, width: 4, height: 4, background: "#1c1c1e" }} />

        <div
          style={{
            position: "absolute",
            left: 26,
            top: 44,
            width: 42,
            height: 44,
            background: topColor,
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 14,
            top: 49,
            width: 14,
            height: 35,
            background: skinColor,
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 66,
            top: 49,
            width: 14,
            height: 35,
            background: skinColor,
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 28,
            top: 86,
            width: 17,
            height: 36,
            background: bottomColor,
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 49,
            top: 86,
            width: 17,
            height: 36,
            background: bottomColor,
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 28,
            top: 120,
            width: 17,
            height: 8,
            background: "#2d221d",
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 49,
            top: 120,
            width: 17,
            height: 8,
            background: "#2d221d",
            border: "3px solid #17110d",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}

export default function CreateAvatarPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [gender, setGender] = useState<Gender>("boy");
  const [skin, setSkin] = useState("light");
  const [hair, setHair] = useState("black");
  const [top, setTop] = useState("blue");
  const [bottom, setBottom] = useState("black");
  const [saving, setSaving] = useState(false);

  const figureString = useMemo(() => {
    return `gender=${gender};skin=${skin};hair=${hair};top=${top};bottom=${bottom}`;
  }, [gender, skin, hair, top, bottom]);

  async function handleCreate() {
    if (!username.trim()) return;

    try {
      setSaving(true);

      console.log("CREATE AVATAR", {
        username: username.trim(),
        gender,
        skin,
        hair,
        top,
        bottom,
        figureString,
      });

      router.push("/room");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #1597ea 0%, #1489d7 38%, #0d1f31 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top, rgba(255,255,255,0.14), transparent 36%)",
          pointerEvents: "none",
        }}
      />

      <section
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 18,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1180,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 0.9fr)",
            gap: 22,
          }}
        >
          <div
            style={{
              borderRadius: 28,
              padding: 22,
              background: "rgba(7,11,18,0.34)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 26px 70px rgba(0,0,0,0.24)",
              backdropFilter: "blur(10px)",
              color: "#fff",
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 900,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              EtherWorld
            </div>

            <div
              style={{
                fontSize: 40,
                lineHeight: 0.96,
                fontWeight: 900,
                textTransform: "uppercase",
                color: "#ffd74c",
                textShadow: "0 4px 0 #9d6400, 0 10px 20px rgba(0,0,0,0.22)",
                marginBottom: 10,
              }}
            >
              Création avatar
            </div>

            <div
              style={{
                fontSize: 15,
                opacity: 0.92,
                maxWidth: 620,
                marginBottom: 18,
              }}
            >
              Ton login est déjà prêt. Ici tu choisis maintenant ton personnage avant
              d’entrer dans le monde.
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "260px minmax(0, 1fr)",
                gap: 18,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  borderRadius: 22,
                  padding: 16,
                  background: "rgba(9,13,22,0.78)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: 1.3,
                    opacity: 0.72,
                    marginBottom: 8,
                  }}
                >
                  Aperçu live
                </div>

                <PixelAvatarPreview
                  gender={gender}
                  skin={skin}
                  hair={hair}
                  top={top}
                  bottom={bottom}
                />

                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.05)",
                    fontSize: 12,
                    color: "#f7e8b2",
                    wordBreak: "break-word",
                  }}
                >
                  {figureString}
                </div>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div
                  style={{
                    borderRadius: 20,
                    padding: 16,
                    background: "rgba(9,13,22,0.78)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      opacity: 0.72,
                      marginBottom: 8,
                    }}
                  >
                    Nom du personnage
                  </label>

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

                <div
                  style={{
                    borderRadius: 20,
                    padding: 16,
                    background: "rgba(9,13,22,0.78)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                      opacity: 0.72,
                      marginBottom: 10,
                    }}
                  >
                    Style
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(["boy", "girl"] as Gender[]).map((value) => {
                      const active = gender === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setGender(value)}
                          style={{
                            height: 46,
                            padding: "0 16px",
                            borderRadius: 14,
                            border: active
                              ? "2px solid #ffd24a"
                              : "1px solid rgba(255,255,255,0.12)",
                            background: active
                              ? "linear-gradient(180deg, #ffd84c 0%, #e7a90d 100%)"
                              : "rgba(255,255,255,0.06)",
                            color: active ? "#211300" : "#fff",
                            fontWeight: 900,
                            cursor: "pointer",
                            textTransform: "uppercase",
                          }}
                        >
                          {value === "boy" ? "Garçon" : "Fille"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 20,
                    padding: 16,
                    background: "rgba(9,13,22,0.78)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        opacity: 0.72,
                        marginBottom: 10,
                      }}
                    >
                      Peau
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {skinOptions.map((option) => (
                        <ChoiceChip
                          key={option.id}
                          active={skin === option.id}
                          label={option.label}
                          color={option.color}
                          onClick={() => setSkin(option.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        opacity: 0.72,
                        marginBottom: 10,
                      }}
                    >
                      Cheveux
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {hairOptions.map((option) => (
                        <ChoiceChip
                          key={option.id}
                          active={hair === option.id}
                          label={option.label}
                          color={option.color}
                          onClick={() => setHair(option.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        opacity: 0.72,
                        marginBottom: 10,
                      }}
                    >
                      Haut
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {topOptions.map((option) => (
                        <ChoiceChip
                          key={option.id}
                          active={top === option.id}
                          label={option.label}
                          color={option.color}
                          onClick={() => setTop(option.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                        opacity: 0.72,
                        marginBottom: 10,
                      }}
                    >
                      Bas
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {bottomOptions.map((option) => (
                        <ChoiceChip
                          key={option.id}
                          active={bottom === option.id}
                          label={option.label}
                          color={option.color}
                          onClick={() => setBottom(option.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={saving || !username.trim()}
                  style={{
                    height: 68,
                    borderRadius: 18,
                    border: "3px solid #724900",
                    background:
                      saving || !username.trim()
                        ? "linear-gradient(180deg, #ccb065 0%, #8e7341 100%)"
                        : "linear-gradient(180deg, #ffd84c 0%, #e7a90d 100%)",
                    color: "#211300",
                    fontWeight: 900,
                    fontSize: 28,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    cursor: saving || !username.trim() ? "not-allowed" : "pointer",
                    boxShadow: "0 8px 0 #8b5f00, 0 18px 30px rgba(0,0,0,0.24)",
                  }}
                >
                  {saving ? "Création..." : "Créer mon personnage"}
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              minHeight: 720,
              borderRadius: 28,
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(11,20,35,0.18) 100%)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: "0 26px 70px rgba(0,0,0,0.24)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(40,160,255,0.14) 0%, rgba(8,18,32,0.2) 100%)",
              }}
            />

            <div
              style={{
                position: "absolute",
                right: -12,
                bottom: -8,
                width: 420,
                height: 620,
                background: "linear-gradient(180deg, #f5a21d 0%, #cb7313 100%)",
                clipPath:
                  "polygon(35% 0%, 100% 0%, 100% 100%, 0 100%, 9% 72%, 22% 62%, 25% 45%, 18% 28%)",
                borderLeft: "4px solid rgba(0,0,0,0.24)",
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 28,
                top: 26,
                right: 28,
                fontSize: 20,
                fontWeight: 900,
                textTransform: "uppercase",
                color: "#fff8df",
                textShadow: "0 3px 0 rgba(0,0,0,0.24)",
              }}
            >
              Prêt à entrer dans EtherWorld
            </div>

            <div
              style={{
                position: "absolute",
                left: 28,
                top: 64,
                right: 28,
                maxWidth: 420,
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.5,
              }}
            >
              Choisis ton identité visuelle maintenant. Une fois créé, ton personnage
              sera utilisé dans les rooms, le profil et le chat.
            </div>

            <div
              style={{
                position: "absolute",
                left: 40,
                bottom: 38,
                display: "flex",
                gap: 14,
                alignItems: "end",
              }}
            >
              <div style={{ width: 52, height: 100, background: "#1d61d5", border: "4px solid #121212", boxShadow: "8px 8px 0 rgba(0,0,0,0.18)" }} />
              <div style={{ width: 56, height: 126, background: "#ffffff", border: "4px solid #121212", boxShadow: "8px 8px 0 rgba(0,0,0,0.18)" }} />
              <div style={{ width: 56, height: 116, background: "#f38bc8", border: "4px solid #121212", boxShadow: "8px 8px 0 rgba(0,0,0,0.18)" }} />
              <div style={{ width: 54, height: 112, background: "#d74021", border: "4px solid #121212", boxShadow: "8px 8px 0 rgba(0,0,0,0.18)" }} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
