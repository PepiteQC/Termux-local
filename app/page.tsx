"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const steps = [
  { label: "Configuration du jeu...", pct: 10 },
  { label: "Chargement des avatars...", pct: 25 },
  { label: "Chargement des meubles...", pct: 40 },
  { label: "Chargement des items...", pct: 55 },
  { label: "Chargement des chambres...", pct: 70 },
  { label: "Initialisation du moteur...", pct: 85 },
  { label: "Connexion à EtherWorld...", pct: 95 },
  { label: "PRÊT !", pct: 100 },
];

export default function HomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState("Initialisation...");

  useEffect(() => {
    if (index >= steps.length) {
      const timeout = setTimeout(() => {
        router.push("/room");
      }, 700);

      return () => clearTimeout(timeout);
    }

    const step = steps[index];
    const timeout = setTimeout(() => {
      setProgress(step.pct);
      setLabel(step.label);
      setIndex((prev) => prev + 1);
    }, 500 + Math.random() * 300);

    return () => clearTimeout(timeout);
  }, [index, router]);

  return (
    <main className="ether-loader-page">
      <section className="ether-loader-card">
        <div className="ether-loader-icon">🔱</div>
        <div className="ether-loader-logo">ETHERWORLD</div>
        <div className="ether-loader-subtitle">HABBO-STYLE GAME ENGINE</div>

        <div className="ether-loader-bar">
          <div
            className="ether-loader-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="ether-loader-status">{label}</div>
        <div className="ether-loader-version">v2.0.0 — Premium Chamber</div>
      </section>
    </main>
  );
}
