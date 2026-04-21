"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

type RoomSummary = {
	id: string
	name: string
	category: string
	description: string
	currentUsers: number
	maxUsers: number
}

type HabboLike = {
	switchRoomById: (id: string) => boolean
	listRooms: () => RoomSummary[]
	getCurrentRoomId: () => string | null
	teleportAvatarTo: (x: number, y: number) => boolean
	destroy?: () => void
}

type PanelKey = "rooms" | "wardrobe" | "shop" | "inventory" | "admin" | "gangs" | null

const FACTIONS = [
	{ id: "blonds", name: "Les Blonds", color: "#d9a54a", tagline: "Old school · or" },
	{ id: "bmf", name: "BMF", color: "#c8313f", tagline: "Cash · respect" },
	{ id: "vagos", name: "Vagos", color: "#d9a02d", tagline: "Desert · bikes" },
	{ id: "crips", name: "Crips", color: "#2f5fa6", tagline: "Blue flag" },
	{ id: "motards", name: "Motards", color: "#232323", tagline: "Chrome · feu" },
	{ id: "quebec", name: "Québec", color: "#4f8ba7", tagline: "Froid · QC" }
] as const

const OUTFITS = [
	{ id: "casual", name: "Casual urbain", look: { top: "#4a7fb0", bottom: "#272b33" } },
	{ id: "employee-weed", name: "Employé Weed Shop", look: { top: "#2e5f3d", bottom: "#1a1a1a" } },
	{ id: "street", name: "Streetwear", look: { top: "#0a0a0a", bottom: "#5a5a66" } },
	{ id: "vip-noir", name: "VIP noir néon", look: { top: "#1a0f2a", bottom: "#0a0a14" } },
	{ id: "cyber", name: "Cyber", look: { top: "#4a2a6e", bottom: "#1e1a3a" } },
	{ id: "ice-quebec", name: "Ice Québec", look: { top: "#4f8ba7", bottom: "#172c3e" } }
]

const SHOP_ITEMS = [
	{ id: "jar-diamond", name: "Diamond Sauce", tier: "Rare", price: "4 200 EW", emoji: "💎" },
	{ id: "jar-liveresin", name: "Live Resin", tier: "Premium", price: "2 800 EW", emoji: "🧪" },
	{ id: "jar-hash", name: "Hash", tier: "Classic", price: "1 400 EW", emoji: "🟫" },
	{ id: "jar-pot", name: "Pot premium", tier: "Classic", price: "900 EW", emoji: "🟢" },
	{ id: "coke-brick", name: "Brique coke", tier: "Gang", price: "9 500 EW", emoji: "❄️" },
	{ id: "molly", name: "Molly", tier: "Gang", price: "3 100 EW", emoji: "💊" },
	{ id: "ecsta", name: "Ecsta", tier: "Gang", price: "2 600 EW", emoji: "💗" }
]

function useHabboInstance() {
	const [instance, setInstance] = useState<HabboLike | null>(null)

	useEffect(() => {
		const poll = () => {
			const w = window as unknown as { __habbo?: HabboLike }
			if (w.__habbo) {
				setInstance(w.__habbo)
				return true
			}
			return false
		}
		if (poll()) return
		const id = window.setInterval(() => {
			if (poll()) window.clearInterval(id)
		}, 300)
		return () => window.clearInterval(id)
	}, [])

	return instance
}

export default function ClientGameShell() {
	const gameRootRef = useRef<HTMLDivElement | null>(null)
	const habbo = useHabboInstance()

	const [panel, setPanel] = useState<PanelKey>(null)
	const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
	const [rooms, setRooms] = useState<RoomSummary[]>([])
	const [faction, setFaction] = useState<string>("blonds")
	const [outfit, setOutfit] = useState<string>("casual")
	const [username, setUsername] = useState<string>("")
	const [teleportX, setTeleportX] = useState("2")
	const [teleportY, setTeleportY] = useState("4")
	const [status, setStatus] = useState<string>("")

	useEffect(() => {
		if (typeof window === "undefined") return
		const stored = window.localStorage.getItem("ew-username")
		if (stored) setUsername(stored)
	}, [])

	useEffect(() => {
		if (!habbo) return
		setRooms(habbo.listRooms())
		setCurrentRoomId(habbo.getCurrentRoomId())

		const onChange = (event: Event) => {
			const detail = (event as CustomEvent<{ id: string }>).detail
			setCurrentRoomId(detail?.id ?? habbo.getCurrentRoomId())
		}
		window.addEventListener("ew-room-change", onChange)
		return () => window.removeEventListener("ew-room-change", onChange)
	}, [habbo])

	useEffect(() => {
		const root = gameRootRef.current
		if (!root) return
		let destroyed = false
		let gameInstance: { destroy?: () => void } | null = null

		async function boot() {
			if (!root) return
			try {
				root.innerHTML = ""
				const HabboModule = await import("@/src/Habbo").catch((error) => {
					console.error("Failed to import Habbo module:", error)
					return null
				})
				if (destroyed) return
				if (HabboModule?.default) {
					const Habbo = HabboModule.default
					const game = new Habbo()
					const gameRoot = document.getElementById("etherworld-game-root")
					if (gameRoot) {
						await game.init(gameRoot)
						gameInstance = game
					}
					return
				}
				const fallback = document.createElement("div")
				fallback.className = "ew-client-fallback"
				fallback.textContent = "Habbo client non initialisé."
				root.appendChild(fallback)
			} catch (error) {
				console.error("Failed to boot client:", error)
			}
		}

		boot()
		return () => {
			destroyed = true
			if (gameInstance?.destroy) gameInstance.destroy()
		}
	}, [])

	const currentRoom = useMemo(
		() => rooms.find((r) => r.id === currentRoomId) ?? null,
		[rooms, currentRoomId]
	)

	const handleSwitchRoom = useCallback(
		(id: string) => {
			if (!habbo) return
			if (habbo.switchRoomById(id)) {
				setStatus(`Téléportation vers ${id}`)
				setTimeout(() => setStatus(""), 1500)
			}
		},
		[habbo]
	)

	const handleTeleport = useCallback(() => {
		if (!habbo) return
		const x = Number(teleportX)
		const y = Number(teleportY)
		if (Number.isFinite(x) && Number.isFinite(y)) {
			habbo.teleportAvatarTo(x, y)
			setStatus(`Avatar déplacé à (${x}, ${y})`)
			setTimeout(() => setStatus(""), 1500)
		}
	}, [habbo, teleportX, teleportY])

	const togglePanel = (key: Exclude<PanelKey, null>) => {
		setPanel((current) => (current === key ? null : key))
	}

	const gangRooms = rooms.filter((r) => r.category === "gang")
	const shopRooms = rooms.filter((r) => r.category === "shop")
	const mainRooms = rooms.filter((r) => r.category !== "gang" && r.category !== "shop")

	return (
		<div className="ew-client-shell">
			<div id="etherworld-game-root" ref={gameRootRef} className="ew-client-canvas-root" />

			<div className="ew-client-overlay-top">
				<div className="ew-client-logo">
					<span className="ew-client-logo-mark">🔱</span>
					<span>ETHERWORLD</span>
				</div>
				<div className="ew-client-room-chip">
					<span className="ew-client-room-chip-dot" />
					<span className="ew-client-room-chip-name">{currentRoom?.name ?? "Chargement…"}</span>
					{currentRoom ? (
						<span className="ew-client-room-chip-users">{currentRoom.currentUsers}/{currentRoom.maxUsers}</span>
					) : null}
				</div>
				<div className="ew-client-user-chip">
					<span className="ew-client-user-avatar">👤</span>
					<span>{username || "Invité"}</span>
				</div>
			</div>

			{status ? <div className="ew-client-status">{status}</div> : null}

			<div className="ew-client-toolbar">
				<button className={`ew-tool ${panel === "rooms" ? "active" : ""}`} onClick={() => togglePanel("rooms")}>
					<span className="ew-tool-icon">🏠</span>
					<span>Rooms</span>
				</button>
				<button className={`ew-tool ${panel === "wardrobe" ? "active" : ""}`} onClick={() => togglePanel("wardrobe")}>
					<span className="ew-tool-icon">👕</span>
					<span>Dressing</span>
				</button>
				<button className={`ew-tool ${panel === "shop" ? "active" : ""}`} onClick={() => togglePanel("shop")}>
					<span className="ew-tool-icon">🛍️</span>
					<span>Shop</span>
				</button>
				<button className={`ew-tool ${panel === "inventory" ? "active" : ""}`} onClick={() => togglePanel("inventory")}>
					<span className="ew-tool-icon">🎒</span>
					<span>Inventaire</span>
				</button>
				<button className={`ew-tool ${panel === "gangs" ? "active" : ""}`} onClick={() => togglePanel("gangs")}>
					<span className="ew-tool-icon">⚜️</span>
					<span>Gangs</span>
				</button>
				<button className={`ew-tool admin ${panel === "admin" ? "active" : ""}`} onClick={() => togglePanel("admin")}>
					<span className="ew-tool-icon">⚙️</span>
					<span>Admin</span>
				</button>
			</div>

			{panel ? (
				<div className="ew-panel-backdrop" onClick={() => setPanel(null)}>
					<div className="ew-panel" onClick={(e) => e.stopPropagation()}>
						<header className="ew-panel-head">
							<h2 className="ew-panel-title">{panelTitle(panel)}</h2>
							<button className="ew-panel-close" onClick={() => setPanel(null)}>×</button>
						</header>

						{panel === "rooms" ? (
							<div className="ew-panel-body">
								<RoomGroup title="Spawn" rooms={mainRooms} currentId={currentRoomId} onPick={handleSwitchRoom} />
								<RoomGroup title="Shops" rooms={shopRooms} currentId={currentRoomId} onPick={handleSwitchRoom} />
								<RoomGroup title="Planques de gang" rooms={gangRooms} currentId={currentRoomId} onPick={handleSwitchRoom} />
							</div>
						) : null}

						{panel === "wardrobe" ? (
							<div className="ew-panel-body ew-panel-grid">
								{OUTFITS.map((item) => (
									<button
										key={item.id}
										className={`ew-card ${outfit === item.id ? "selected" : ""}`}
										onClick={() => setOutfit(item.id)}
									>
										<div
											className="ew-card-swatch"
											style={{ background: `linear-gradient(180deg, ${item.look.top} 0%, ${item.look.bottom} 100%)` }}
										/>
										<div className="ew-card-name">{item.name}</div>
										{outfit === item.id ? <div className="ew-card-tag">ACTIF</div> : null}
									</button>
								))}
							</div>
						) : null}

						{panel === "shop" ? (
							<div className="ew-panel-body">
								<div className="ew-shop-grid">
									{SHOP_ITEMS.map((item) => (
										<div key={item.id} className="ew-shop-item">
											<div className="ew-shop-emoji">{item.emoji}</div>
											<div className="ew-shop-name">{item.name}</div>
											<div className="ew-shop-tier">{item.tier}</div>
											<div className="ew-shop-price">{item.price}</div>
											<button className="ew-shop-buy">Acheter</button>
										</div>
									))}
								</div>
							</div>
						) : null}

						{panel === "inventory" ? (
							<div className="ew-panel-body">
								<div className="ew-empty-slot">Ton inventaire est vide. Achète du stock dans le Shop ou fais des deals dans les planques de gang.</div>
							</div>
						) : null}

						{panel === "gangs" ? (
							<div className="ew-panel-body">
								<div className="ew-panel-grid">
									{FACTIONS.map((f) => (
										<button
											key={f.id}
											className={`ew-card ${faction === f.id ? "selected" : ""}`}
											onClick={() => {
												setFaction(f.id)
												handleSwitchRoom(`gang-${f.id}`)
											}}
										>
											<div className="ew-card-swatch" style={{ background: f.color }} />
											<div className="ew-card-name">{f.name}</div>
											<div className="ew-card-sub">{f.tagline}</div>
											{faction === f.id ? <div className="ew-card-tag">CREW</div> : null}
										</button>
									))}
								</div>
								<div className="ew-panel-footer">
									<p>Actions disponibles dans ta planque : production, deals, ventes, rivalités. Clique une faction pour entrer.</p>
								</div>
							</div>
						) : null}

						{panel === "admin" ? (
							<div className="ew-panel-body">
								<section className="ew-admin-block">
									<h3>Chambre active</h3>
									<div className="ew-admin-row">
										<span className="ew-admin-label">Room :</span>
										<span className="ew-admin-value">{currentRoom?.name ?? "—"}</span>
									</div>
									<div className="ew-admin-row">
										<span className="ew-admin-label">Occupation :</span>
										<span className="ew-admin-value">{currentRoom ? `${currentRoom.currentUsers} / ${currentRoom.maxUsers}` : "—"}</span>
									</div>
									<div className="ew-admin-row">
										<span className="ew-admin-label">ID :</span>
										<span className="ew-admin-value">{currentRoom?.id ?? "—"}</span>
									</div>
								</section>

								<section className="ew-admin-block">
									<h3>Switch room</h3>
									<div className="ew-admin-actions">
										{rooms.map((room) => (
											<button
												key={room.id}
												onClick={() => handleSwitchRoom(room.id)}
												className={`ew-admin-chip ${room.id === currentRoomId ? "active" : ""}`}
											>
												{room.name}
											</button>
										))}
									</div>
								</section>

								<section className="ew-admin-block">
									<h3>Téléporter avatar</h3>
									<div className="ew-admin-teleport">
										<label>X <input value={teleportX} onChange={(e) => setTeleportX(e.target.value)} /></label>
										<label>Y <input value={teleportY} onChange={(e) => setTeleportY(e.target.value)} /></label>
										<button onClick={handleTeleport}>Téléporter</button>
									</div>
								</section>

								<section className="ew-admin-block">
									<h3>Stats</h3>
									<div className="ew-admin-row"><span className="ew-admin-label">Rooms totales :</span><span className="ew-admin-value">{rooms.length}</span></div>
									<div className="ew-admin-row"><span className="ew-admin-label">Planques gang :</span><span className="ew-admin-value">{gangRooms.length}</span></div>
									<div className="ew-admin-row"><span className="ew-admin-label">Shops :</span><span className="ew-admin-value">{shopRooms.length}</span></div>
								</section>
							</div>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	)
}

function panelTitle(panel: Exclude<PanelKey, null>): string {
	switch (panel) {
		case "rooms": return "Navigator · Rooms"
		case "wardrobe": return "Dressing"
		case "shop": return "Shop EtherWorld"
		case "inventory": return "Inventaire"
		case "gangs": return "Factions & planques"
		case "admin": return "Admin panel"
	}
}

function RoomGroup({
	title,
	rooms,
	currentId,
	onPick
}: {
	title: string
	rooms: RoomSummary[]
	currentId: string | null
	onPick: (id: string) => void
}) {
	if (rooms.length === 0) return null
	return (
		<section className="ew-room-group">
			<h3>{title}</h3>
			<div className="ew-room-list">
				{rooms.map((room) => (
					<button
						key={room.id}
						onClick={() => onPick(room.id)}
						className={`ew-room-card ${room.id === currentId ? "active" : ""}`}
					>
						<div className="ew-room-card-name">{room.name}</div>
						<div className="ew-room-card-desc">{room.description}</div>
						<div className="ew-room-card-users">
							<span className="ew-room-card-dot" />
							{room.currentUsers} / {room.maxUsers}
						</div>
					</button>
				))}
			</div>
		</section>
	)
}
