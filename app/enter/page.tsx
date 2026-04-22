"use client";

import { useRouter } from "next/navigation";
import styles from "./enter.module.css";

function syncViewportForGame() {
  if (typeof window === "undefined") return;

  const width = Math.max(window.innerWidth, 320);
  const height = Math.max(window.innerHeight, 480);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const payload = {
    width,
    height,
    dpr,
    renderWidth: Math.round(width * dpr),
    renderHeight: Math.round(height * dpr),
    aspectRatio: Number((width / height).toFixed(4)),
    updatedAt: Date.now(),
  };

  window.localStorage.setItem("ew-session", "1");
  window.localStorage.setItem("ew-client-resolution", JSON.stringify(payload));

  document.documentElement.style.setProperty("--ew-game-width", `${width}px`);
  document.documentElement.style.setProperty("--ew-game-height", `${height}px`);
  document.documentElement.style.setProperty("--ew-game-dpr", String(dpr));
}

export default function EnterPage() {
  const router = useRouter();

  function handleConnect() {
    syncViewportForGame();
    requestAnimationFrame(() => {
      router.replace("/client");
    });
  }

  return (
    <main className={styles.screen}>
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.art} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />

      <button
        type="button"
        className={styles.connectHitbox}
        onClick={handleConnect}
        aria-label="Connexion"
      >
        <span className={styles.srOnly}>Connexion</span>
      </button>
    </main>
  );
}
