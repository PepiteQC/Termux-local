"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientGameShell from "./ClientGameShell";

type StoredViewport = {
  width: number;
  height: number;
  dpr: number;
  renderWidth: number;
  renderHeight: number;
  aspectRatio: number;
  updatedAt: number;
};

function applyStoredViewport() {
  if (typeof window === "undefined") return;

  const raw = window.localStorage.getItem("ew-client-resolution");
  if (!raw) return;

  try {
    const viewport = JSON.parse(raw) as StoredViewport;
    const root = document.documentElement;

    root.style.setProperty("--ew-game-width", `${viewport.width}px`);
    root.style.setProperty("--ew-game-height", `${viewport.height}px`);
    root.style.setProperty("--ew-game-dpr", String(viewport.dpr));
    root.style.setProperty("--ew-render-width", `${viewport.renderWidth}px`);
    root.style.setProperty("--ew-render-height", `${viewport.renderHeight}px`);

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new CustomEvent("ew:viewport-sync", { detail: viewport }));
  } catch {
    window.localStorage.removeItem("ew-client-resolution");
  }
}

export default function ClientPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = window.localStorage.getItem("ew-session");
    if (session !== "1") {
      router.replace("/enter");
      return;
    }

    applyStoredViewport();
    setAllowed(true);
  }, [router]);

  if (!allowed) return null;

  return <ClientGameShell />;
}
