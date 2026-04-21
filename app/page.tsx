"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const steps = [
	{ label: "Configuration du jeu…", pct: 10 },
	{ label: "Chargement des avatars…", pct: 25 },
	{ label: "Chargement des meubles…", pct: 40 },
	{ label: "Chargement des chambres…", pct: 55 },
	{ label: "Initialisation du moteur iso…", pct: 72 },
	{ label: "Synchronisation EtherWorld…", pct: 88 },
	{ label: "PRÊT !", pct: 100 }
]

export default function HomePage() {
	const router = useRouter()
	const [pseudo, setPseudo] = useState("")
	const [index, setIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const [label, setLabel] = useState("En attente…")
	const [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (typeof window === "undefined") return
		const stored = window.localStorage.getItem("ew-username")
		if (stored) setPseudo(stored)
	}, [])

	const handleConnect = () => {
		const clean = pseudo.trim().slice(0, 24) || "Invité"
		if (typeof window !== "undefined") {
			window.localStorage.setItem("ew-username", clean)
		}
		setPseudo(clean)
		setIsLoading(true)
		setIndex(0)
	}

	useEffect(() => {
		if (!isLoading) return
		if (index >= steps.length) {
			const t = setTimeout(() => router.push("/room"), 600)
			return () => clearTimeout(t)
		}
		const step = steps[index]
		const t = setTimeout(() => {
			setProgress(step.pct)
			setLabel(step.label)
			setIndex((prev) => prev + 1)
		}, 420 + Math.random() * 260)
		return () => clearTimeout(t)
	}, [index, router, isLoading])

	return (
		<main className="ew-landing">
			<div className="ew-landing-bg" aria-hidden />

			<div className="ew-landing-grid" aria-hidden>
				<div className="ew-landing-grid-floor" />
			</div>

			<section className="ew-landing-card">
				<div className="ew-landing-mark">🔱</div>
				<h1 className="ew-landing-title">ETHERWORLD</h1>
				<p className="ew-landing-subtitle">Pixel art social club · Habbo-style · 2.5D iso</p>

				{!isLoading ? (
					<form
						className="ew-landing-form"
						onSubmit={(e) => {
							e.preventDefault()
							handleConnect()
						}}
					>
						<label className="ew-landing-label" htmlFor="ew-pseudo">Pseudo</label>
						<input
							id="ew-pseudo"
							className="ew-landing-input"
							value={pseudo}
							onChange={(e) => setPseudo(e.target.value)}
							placeholder="Entre ton pseudo"
							maxLength={24}
							autoFocus
						/>
						<button type="submit" className="ew-landing-connect">CONNEXION</button>
						<div className="ew-landing-hint">Weed Shop · Dépanneur · 6 planques de gang</div>
					</form>
				) : (
					<div className="ew-landing-loader">
						<div className="ew-landing-bar">
							<div className="ew-landing-bar-fill" style={{ width: `${progress}%` }} />
						</div>
						<div className="ew-landing-status">{label}</div>
						<div className="ew-landing-welcome">Bienvenue {pseudo || "Invité"}…</div>
					</div>
				)}

				<footer className="ew-landing-footer">
					<span>v2.1.0 · Premium Chamber</span>
					<span>·</span>
					<span>pixel iso 64×32</span>
				</footer>
			</section>

			<aside className="ew-landing-tags">
				<span className="ew-landing-tag">WEED SHOP</span>
				<span className="ew-landing-tag">DÉPANNEUR</span>
				<span className="ew-landing-tag">BLONDS</span>
				<span className="ew-landing-tag">BMF</span>
				<span className="ew-landing-tag">VAGOS</span>
				<span className="ew-landing-tag">CRIPS</span>
				<span className="ew-landing-tag">MOTARDS</span>
				<span className="ew-landing-tag">QUÉBEC</span>
			</aside>
		</main>
	)
}
