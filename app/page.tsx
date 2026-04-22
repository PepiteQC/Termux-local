"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_SELECTION,
  HAIRS,
  HEADS,
  PALETTE,
  PANTS,
  SHIRTS,
  SHOES,
  figurestringToSelection,
  previewAvatarUrl,
  selectionToFigurestring,
  type FigurePart,
  type FigureSelection,
  type Gender
} from "@/lib/habbo/wardrobe";

type Phase = "gate" | "character" | "connect" | "done";

const CONNECT_STEPS = [
  { label: "Authentification EtherWorld…", pct: 14 },
  { label: "Chargement des avatars…", pct: 26 },
  { label: "Chargement des meubles…", pct: 40 },
  { label: "Chargement des items…", pct: 54 },
  { label: "Chargement des chambres…", pct: 66 },
  { label: "Injection du Green Shop…", pct: 78 },
  { label: "Initialisation du moteur iso…", pct: 90 },
  { label: "Synchronisation finale…", pct: 97 },
  { label: "PRÊT.", pct: 100 }
];

const PART_TABS: Array<{ key: FigurePart; label: string; emoji: string }> = [
  { key: "hr", label: "Cheveux", emoji: "💇" },
  { key: "hd", label: "Visage", emoji: "🙂" },
  { key: "ch", label: "Haut", emoji: "👕" },
  { key: "lg", label: "Bas", emoji: "👖" },
  { key: "sh", label: "Chaussures", emoji: "👟" }
];

export default function HomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("gate");
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const stars = useMemo(() => generateStars(70), []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [username, setUsername] = useState<string>("");
  const [gender, setGender] = useState<Gender>("M");
  const [selection, setSelection] = useState<FigureSelection>(DEFAULT_SELECTION.M);
  const [activePart, setActivePart] = useState<FigurePart>("hr");

  // Load previously saved look / username if any
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedUser = window.localStorage.getItem("ew-username");
    if (savedUser) setUsername(savedUser);
    const savedGender = window.localStorage.getItem("ew-gender") as Gender | null;
    if (savedGender === "M" || savedGender === "F") setGender(savedGender);
    const savedFigure = window.localStorage.getItem("ew-figurestring");
    if (savedFigure) {
      setSelection((_prev) =>
        figurestringToSelection(
          savedFigure,
          DEFAULT_SELECTION[(savedGender === "F" ? "F" : "M") as Gender]
        )
      );
    }
  }, []);

  const figurestring = useMemo(() => selectionToFigurestring(selection), [selection]);
  const previewUrl = useMemo(() => previewAvatarUrl(figurestring, 2, "l"), [figurestring]);
  const previewSideUrl = useMemo(() => previewAvatarUrl(figurestring, 4, "l"), [figurestring]);

  const switchGender = useCallback((next: Gender) => {
    setGender(next);
    setSelection((prev) => ({ ...DEFAULT_SELECTION[next], hd: prev.hd, hr: prev.hr, sh: prev.sh }));
  }, []);

  const pickSet = useCallback((part: FigurePart, setId: number) => {
    setSelection((prev) => ({ ...prev, [part]: { ...prev[part], set: setId } }));
  }, []);

  const pickColor = useCallback((part: FigurePart, colorId: number) => {
    setSelection((prev) => ({ ...prev, [part]: { ...prev[part], color1: colorId } }));
  }, []);

  const sets = useMemo(() => {
    switch (activePart) {
      case "hr":
        return HAIRS[gender];
      case "hd":
        return HEADS[gender];
      case "ch":
        return SHIRTS[gender];
      case "lg":
        return PANTS[gender];
      case "sh":
        return SHOES;
      default:
        return [];
    }
  }, [activePart, gender]);

  useEffect(() => {
    if (phase !== "connect") return;

    if (stepIndex >= CONNECT_STEPS.length) {
      const t = window.setTimeout(() => {
        setPhase("done");
        router.push("/room");
      }, 420);
      return () => window.clearTimeout(t);
    }

    const step = CONNECT_STEPS[stepIndex];
    const delay = 220 + Math.random() * 180;
    const t = window.setTimeout(() => {
      setProgress(step.pct);
      setLabel(step.label);
      setStepIndex((i) => i + 1);
    }, delay);
    return () => window.clearTimeout(t);
  }, [phase, router, stepIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let raf = 0;
    let running = true;
    const t0 = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (!running) return;
      const now = performance.now();
      const t = (now - t0) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#071121");
      grad.addColorStop(0.55, "#050817");
      grad.addColorStop(1, "#02030a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h * 0.55;
      const tileW = Math.min(w, h) * 0.06;
      const tileH = tileW * 0.5;
      const pulse = 0.45 + 0.25 * Math.sin(t * 1.4);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = `rgba(95, 255, 142, ${0.08 + pulse * 0.05})`;
      ctx.lineWidth = 1 * dpr;
      const size = 7;
      for (let x = -size; x <= size; x++) {
        for (let z = -size; z <= size; z++) {
          const sx = (x - z) * (tileW / 2);
          const sy = (x + z) * (tileH / 2);
          ctx.beginPath();
          ctx.moveTo(sx, sy - tileH / 2);
          ctx.lineTo(sx + tileW / 2, sy);
          ctx.lineTo(sx, sy + tileH / 2);
          ctx.lineTo(sx - tileW / 2, sy);
          ctx.closePath();
          ctx.stroke();
        }
      }

      const rgrad = ctx.createRadialGradient(0, 0, 0, 0, 0, tileW * 4);
      rgrad.addColorStop(0, `rgba(79, 195, 247, ${0.18 + pulse * 0.18})`);
      rgrad.addColorStop(1, "rgba(79, 195, 247, 0)");
      ctx.fillStyle = rgrad;
      ctx.fillRect(-tileW * 5, -tileW * 5, tileW * 10, tileW * 10);
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const startCharacter = useCallback(() => {
    setPhase("character");
  }, []);

  const startConnect = useCallback(() => {
    if (typeof window !== "undefined") {
      const trimmed = username.trim() || "Invité";
      window.localStorage.setItem("ew-username", trimmed);
      window.localStorage.setItem("ew-gender", gender);
      window.localStorage.setItem("ew-figurestring", figurestring);
    }
    setPhase("connect");
    setStepIndex(0);
    setProgress(0);
    setLabel(CONNECT_STEPS[0].label);
  }, [username, gender, figurestring]);

  return (
    <main className="ew-entry">
      <canvas ref={canvasRef} className="ew-entry-canvas" />
      <div className="ew-entry-stars" aria-hidden>
        {stars.map((s, i) => (
          <span
            key={i}
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.r}px`,
              height: `${s.r}px`,
              opacity: s.o,
              animationDelay: `${s.d}s`
            }}
          />
        ))}
      </div>
      <div className="ew-entry-glow ew-entry-glow--tl" />
      <div className="ew-entry-glow ew-entry-glow--br" />

      {phase === "gate" ? (
        <section className="ew-entry-minimal">
          <h1 className="ew-entry-logo">
            ETHER<span>WORLD</span>
          </h1>
          <button
            type="button"
            className="ew-entry-enter"
            onClick={startCharacter}
            autoFocus
          >
            ENTRER
          </button>
        </section>
      ) : null}

      {phase === "character" ? (
        <section className="ew-entry-character">
          <h1 className="ew-entry-logo">
            ETHER<span>WORLD</span>
          </h1>
          <div className="ew-char-grid">
            <div className="ew-char-preview">
              <div className="ew-char-preview-stage">
                <img
                  src={previewUrl}
                  alt="Avatar face"
                  className="ew-char-avatar ew-char-avatar-front"
                  referrerPolicy="no-referrer"
                />
                <img
                  src={previewSideUrl}
                  alt="Avatar profil"
                  className="ew-char-avatar ew-char-avatar-side"
                  referrerPolicy="no-referrer"
                />
              </div>

              <label className="ew-char-field">
                <span>Nom</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                  placeholder="Ton pseudo"
                  maxLength={20}
                />
              </label>

              <div className="ew-char-gender">
                <button
                  type="button"
                  className={`ew-char-gender-btn ${gender === "M" ? "active" : ""}`}
                  onClick={() => switchGender("M")}
                >
                  <span>♂</span> Homme
                </button>
                <button
                  type="button"
                  className={`ew-char-gender-btn ${gender === "F" ? "active" : ""}`}
                  onClick={() => switchGender("F")}
                >
                  <span>♀</span> Femme
                </button>
              </div>
            </div>

            <div className="ew-char-editor">
              <div className="ew-char-tabs">
                {PART_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`ew-char-tab ${activePart === tab.key ? "active" : ""}`}
                    onClick={() => setActivePart(tab.key)}
                    aria-label={tab.label}
                  >
                    <span className="ew-char-tab-emoji">{tab.emoji}</span>
                    <span className="ew-char-tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="ew-char-sets">
                {sets.map((set) => (
                  <button
                    key={set.id}
                    type="button"
                    className={`ew-char-set ${selection[activePart].set === set.id ? "active" : ""}`}
                    onClick={() => pickSet(activePart, set.id)}
                  >
                    {set.label}
                  </button>
                ))}
              </div>

              <div className="ew-char-palette">
                {PALETTE.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    className={`ew-char-swatch ${selection[activePart].color1 === color.id ? "active" : ""}`}
                    style={{ background: color.hex }}
                    onClick={() => pickColor(activePart, color.id)}
                    aria-label={color.label}
                    title={color.label}
                  />
                ))}
              </div>

              <button
                type="button"
                className="ew-entry-enter ew-char-confirm"
                onClick={startConnect}
                disabled={!username.trim()}
              >
                ENTRER DANS LA ROOM
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {phase === "connect" || phase === "done" ? (
        <section className="ew-entry-minimal">
          <h1 className="ew-entry-logo">
            ETHER<span>WORLD</span>
          </h1>
          <div className="ew-entry-connecting">
            <div className="ew-entry-bar">
              <div className="ew-entry-fill" style={{ width: `${progress}%` }} />
              <div className="ew-entry-bar-shine" />
            </div>
            <div className="ew-entry-status">{label || "Connexion…"}</div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

type Star = { x: number; y: number; r: number; o: number; d: number };

function generateStars(count: number): Star[] {
  const out: Star[] = [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    out.push({
      x: rand() * 100,
      y: rand() * 100,
      r: 1 + rand() * 2,
      o: 0.3 + rand() * 0.7,
      d: rand() * 4
    });
  }
  return out;
}
