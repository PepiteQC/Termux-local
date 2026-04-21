"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "gate" | "connect" | "done";

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

export default function HomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("gate");
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("");
  const stars = useMemo(() => generateStars(70), []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    let t0 = performance.now();

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

  const startConnect = useCallback(() => {
    setPhase("connect");
    setStepIndex(0);
    setProgress(0);
    setLabel(CONNECT_STEPS[0].label);
  }, []);

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

      <section className="ew-entry-minimal">
        <h1 className="ew-entry-logo">
          ETHER<span>WORLD</span>
        </h1>

        {phase === "gate" ? (
          <button
            type="button"
            className="ew-entry-enter"
            onClick={startConnect}
            autoFocus
          >
            ENTRER
          </button>
        ) : (
          <div className="ew-entry-connecting">
            <div className="ew-entry-bar">
              <div className="ew-entry-fill" style={{ width: `${progress}%` }} />
              <div className="ew-entry-bar-shine" />
            </div>
            <div className="ew-entry-status">{label || "Connexion…"}</div>
          </div>
        )}
      </section>
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
