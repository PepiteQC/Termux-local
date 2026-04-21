"use client";

import { useEffect, useRef, useState } from "react";

import Habbo from "@/src/Habbo";

export default function PixiRoom() {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Habbo | null>(null);
  const [status, setStatus] = useState("Initialisation du moteur room...");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let active = true;
    const game = new Habbo();
    gameRef.current = game;

    const boot = async () => {
      try {
        setStatus("Construction de la room premium...");
        await game.init(host);

        if (active) {
          setStatus(
            "Room active. Clic gauche sur une tuile: deplacement avatar. Clic droit-glisser: camera. Molette: zoom."
          );
        }
      } catch (error) {
        console.error("PixiRoom init error:", error);

        if (active) {
          setStatus("Erreur d'initialisation du moteur room.");
        }
      }
    };

    void boot();

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      game.resize(
        Math.max(960, Math.floor(entry.contentRect.width)),
        Math.max(640, Math.floor(entry.contentRect.height))
      );
    });

    resizeObserver.observe(host);

    return () => {
      active = false;
      resizeObserver.disconnect();
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #2f2a36 0%, #17161d 46%, #0c0d12 100%)",
        color: "#f6f2eb",
        padding: 18,
      }}
    >
      <section
        style={{
          maxWidth: 1520,
          margin: "0 auto",
          display: "grid",
          gap: 14,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            padding: "14px 18px",
            borderRadius: 22,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 52px rgba(0,0,0,0.25)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                opacity: 0.68,
                marginBottom: 6,
              }}
            >
              EtherWorld / Room Renderer
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>Suite isometrique</div>
            <div style={{ opacity: 0.76, marginTop: 4 }}>
              Focus rendu room Habbo-like, profondeur lisible, hover tile, avatar et base meubles.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 12,
              }}
            >
              Pixel render
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 12,
              }}
            >
              Pixi + viewport
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: 12,
              }}
            >
              Room engine live
            </div>
          </div>
        </header>

        <section
          style={{
            position: "relative",
            height: "80vh",
            minHeight: 680,
            borderRadius: 28,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.22) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 90px rgba(0,0,0,0.42)",
          }}
        >
          <div
            ref={hostRef}
            style={{
              position: "absolute",
              inset: 0,
            }}
          />

          <div
            style={{
              position: "absolute",
              left: 18,
              bottom: 18,
              maxWidth: 520,
              padding: "12px 14px",
              borderRadius: 16,
              background: "rgba(9,10,14,0.56)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              fontSize: 12,
              lineHeight: 1.5,
              color: "#ddd6c9",
            }}
          >
            {status}
          </div>

          <div
            style={{
              position: "absolute",
              right: 18,
              top: 18,
              display: "grid",
              gap: 8,
            }}
          >
            {[
              "Clic gauche: deplacer avatar",
              "Clic droit + drag: deplacer la camera",
              "Molette: zoom pixel net",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "9px 12px",
                  borderRadius: 14,
                  background: "rgba(9,10,14,0.52)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  fontSize: 12,
                  color: "#efe9de",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
