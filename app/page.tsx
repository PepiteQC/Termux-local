"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "login" | "character" | "entering";

const PART_TABS: Array<{ key: FigurePart; label: string }> = [
  { key: "hr", label: "Cheveux" },
  { key: "hd", label: "Visage" },
  { key: "ch", label: "Haut" },
  { key: "lg", label: "Bas" },
  { key: "sh", label: "Chaussures" }
];

export default function HomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("login");
  const [username, setUsername] = useState<string>("");
  const [gender, setGender] = useState<Gender>("M");
  const [selection, setSelection] = useState<FigureSelection>(DEFAULT_SELECTION.M);
  const [activePart, setActivePart] = useState<FigurePart>("hr");
  const [hasExistingCharacter, setHasExistingCharacter] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedUser = window.localStorage.getItem("ew-username");
    if (savedUser) setUsername(savedUser);
    const savedGender = window.localStorage.getItem("ew-gender") as Gender | null;
    if (savedGender === "M" || savedGender === "F") setGender(savedGender);
    const savedFigure = window.localStorage.getItem("ew-figurestring");
    if (savedFigure) {
      setHasExistingCharacter(true);
      setSelection(
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
    setSelection((prev) => {
      const fresh = DEFAULT_SELECTION[next];
      return {
        hr: { set: fresh.hr.set, color1: prev.hr.color1 },
        hd: { set: fresh.hd.set, color1: prev.hd.color1 },
        ch: { set: fresh.ch.set, color1: prev.ch.color1 },
        lg: { set: fresh.lg.set, color1: prev.lg.color1 },
        sh: { set: fresh.sh.set, color1: prev.sh.color1 },
        ha: fresh.ha,
        fa: fresh.fa
      };
    });
  }, []);

  const pickSet = useCallback((part: FigurePart, setId: number) => {
    setSelection((prev) => ({ ...prev, [part]: { ...prev[part], set: setId } }));
  }, []);

  const pickColor = useCallback((part: FigurePart, colorId: number) => {
    setSelection((prev) => ({ ...prev, [part]: { ...prev[part], color1: colorId } }));
  }, []);

  const sets = useMemo(() => {
    switch (activePart) {
      case "hr": return HAIRS[gender];
      case "hd": return HEADS[gender];
      case "ch": return SHIRTS[gender];
      case "lg": return PANTS[gender];
      case "sh": return SHOES[gender];
      default: return [];
    }
  }, [activePart, gender]);

  const enterGame = useCallback(() => {
    if (typeof window !== "undefined") {
      const trimmed = username.trim() || "Invit\u00e9";
      window.localStorage.setItem("ew-username", trimmed);
      window.localStorage.setItem("ew-gender", gender);
      window.localStorage.setItem("ew-figurestring", figurestring);
    }
    setPhase("entering");
    router.push("/client");
  }, [username, gender, figurestring, router]);

  const handleLogin = useCallback(() => {
    if (!username.trim()) return;
    if (hasExistingCharacter) {
      enterGame();
    } else {
      setPhase("character");
    }
  }, [username, hasExistingCharacter, enterGame]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  }, [handleLogin]);

  return (
    <main className="habbo-login-page">
      {phase === "login" && (
        <div className="habbo-login-container">
          <div className="habbo-login-header">
            <h1 className="habbo-login-title">EtherWorld</h1>
            <p className="habbo-login-subtitle">H&ocirc;tel virtuel</p>
          </div>

          <div className="habbo-login-card">
            <div className="habbo-login-form">
              <label className="habbo-login-label">
                Nom d&apos;utilisateur
                <input
                  className="habbo-login-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                  onKeyDown={handleKeyDown}
                  placeholder="Entre ton pseudo"
                  maxLength={20}
                  autoFocus
                />
              </label>

              <button
                type="button"
                className="habbo-login-btn"
                onClick={handleLogin}
                disabled={!username.trim()}
              >
                CONNEXION
              </button>
            </div>

            <div className="habbo-login-footer">
              <span>EtherWorld v1.0</span>
              <span className="habbo-login-dot" />
              <span>Gratuit</span>
            </div>
          </div>
        </div>
      )}

      {phase === "character" && (
        <div className="habbo-login-container">
          <div className="habbo-login-header">
            <h1 className="habbo-login-title">EtherWorld</h1>
            <p className="habbo-login-subtitle">Cr&eacute;e ton personnage</p>
          </div>

          <div className="habbo-char-card">
            <div className="habbo-char-layout">
              <div className="habbo-char-left">
                <div className="habbo-char-stage">
                  <img
                    src={previewUrl}
                    alt="Avatar face"
                    className="habbo-char-avatar"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    src={previewSideUrl}
                    alt="Avatar profil"
                    className="habbo-char-avatar habbo-char-avatar-side"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="habbo-char-gender">
                  <button
                    type="button"
                    className={`habbo-gender-btn ${gender === "M" ? "active" : ""}`}
                    onClick={() => switchGender("M")}
                  >
                    Homme
                  </button>
                  <button
                    type="button"
                    className={`habbo-gender-btn ${gender === "F" ? "active" : ""}`}
                    onClick={() => switchGender("F")}
                  >
                    Femme
                  </button>
                </div>
              </div>

              <div className="habbo-char-right">
                <div className="habbo-char-tabs">
                  {PART_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className={`habbo-char-tab ${activePart === tab.key ? "active" : ""}`}
                      onClick={() => setActivePart(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="habbo-char-sets">
                  {sets.map((set) => (
                    <button
                      key={set.id}
                      type="button"
                      className={`habbo-char-set-btn ${selection[activePart].set === set.id ? "active" : ""}`}
                      onClick={() => pickSet(activePart, set.id)}
                    >
                      {set.label}
                    </button>
                  ))}
                </div>

                <div className="habbo-char-colors">
                  {PALETTE.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      className={`habbo-char-color ${selection[activePart].color1 === color.id ? "active" : ""}`}
                      style={{ background: color.hex }}
                      onClick={() => pickColor(activePart, color.id)}
                      title={color.label}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="habbo-login-btn habbo-char-enter"
                  onClick={enterGame}
                >
                  ENTRER DANS L&apos;H&Ocirc;TEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {phase === "entering" && (
        <div className="habbo-login-container">
          <div className="habbo-login-header">
            <h1 className="habbo-login-title">EtherWorld</h1>
            <p className="habbo-login-subtitle">Connexion en cours&hellip;</p>
          </div>
        </div>
      )}
    </main>
  );
}
