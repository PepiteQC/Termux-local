"use client";

import { useEffect, useRef } from "react";

export default function ClientGameShell() {
  const gameRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = gameRootRef.current;
    if (!root) return;

    let destroyed = false;
    let gameInstance: { destroy?: () => void } | null = null;

    async function boot() {
      if (!root) return;
      try {
        root.innerHTML = "";

        const HabboModule = await import("@/src/Habbo").catch((e) => {
          console.error("Failed to import Habbo module:", e);
          return null;
        });

        if (destroyed) return;

        if (HabboModule?.default) {
          const Habbo = HabboModule.default;
          const game = new Habbo();
          const gameRoot = document.getElementById("etherworld-game-root");
          if (gameRoot) {
            await game.init(gameRoot);
            gameInstance = game;
          }
          return;
        }

        const fallback = document.createElement("div");
        fallback.style.position = "absolute";
        fallback.style.inset = "0";
        fallback.style.display = "flex";
        fallback.style.alignItems = "center";
        fallback.style.justifyContent = "center";
        fallback.style.background =
          "radial-gradient(circle at top, #2f2940 0%, #17151f 40%, #0a0a10 100%)";
        fallback.style.color = "#fff";
        fallback.style.fontWeight = "700";
        fallback.style.fontSize = "20px";
        fallback.textContent = "Habbo client non initialisé.";
        root.appendChild(fallback);
      } catch (error) {
        console.error("Failed to boot client:", error);
      }
    }

    boot();

    return () => {
      destroyed = true;
      if (gameInstance?.destroy) {
        gameInstance.destroy();
      }
    };
  }, []);

  return (
    <div className="ew-client-shell">
      <div
        id="etherworld-game-root"
        ref={gameRootRef}
        className="ew-client-canvas-root"
      />

      <div className="ew-client-overlay-top">
        <div className="ew-client-logo">ETHERWORLD</div>
        <div className="ew-client-badge">fullscreen client</div>
      </div>

      <div className="ew-client-overlay-bottom">
        <button className="ew-client-button">Inventaire</button>
        <button className="ew-client-button">Boutique</button>
        <button className="ew-client-button">Dressing</button>
        <button className="ew-client-button">Navigator</button>
      </div>
    </div>
  );
}
