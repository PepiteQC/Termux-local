"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ChatInput } from "@/components/chat/ChatInput"
import { ChatBubble } from "@/components/chat/ChatBubble"
import {
	DEFAULT_SELECTION,
	HAIRS,
	HEADS,
	PALETTE as FIGURE_PALETTE,
	PANTS,
	SHIRTS,
	SHOES,
	figurestringToSelection,
	previewAvatarUrl,
	selectionToFigurestring,
	type FigurePart,
	type FigureSelection,
	type Gender
} from "@/lib/habbo/wardrobe"

type RoomSummary = {
	id: string
	name: string
	category: string
	description: string
	currentUsers: number
	maxUsers: number
}

type DrugType = "weed" | "coke" | "ecsta" | "molly"
type FactionId = "blonds" | "bmf" | "vagos" | "crips" | "motards" | "quebec"

type GangRecord = {
	id: FactionId
	name: string
	members: string[]
	stock: Record<DrugType, number>
	cash: number
	respect: number
	heat: number
}

type ChatMessage = {
	id: string
	factionId: FactionId
	author: string
	text: string
	at: number
}

type DealLog = {
	id: string
	factionId: FactionId
	kind: "production" | "sale" | "heist" | "war"
	text: string
	at: number
}

type GangSnapshot = {
	gangs: Record<FactionId, GangRecord>
	playerFaction: FactionId | null
	playerName: string
	chat: ChatMessage[]
	deals: DealLog[]
	prices: Record<DrugType, number>
	rivalries: Record<FactionId, FactionId | null>
}

type GangStateLike = {
	getSnapshot: () => GangSnapshot
	subscribe: (cb: () => void) => () => void
	setPlayerName: (name: string) => void
	joinFaction: (id: FactionId) => void
	produce: (id: FactionId, drug: DrugType, qty?: number) => boolean
	sell: (id: FactionId, drug: DrugType, qty?: number) => boolean
	attack: (attacker: FactionId, target: FactionId) => boolean
	chat: (id: FactionId, author: string, text: string) => boolean
	tick: () => void
}

type HabboLike = {
	switchRoomById: (id: string) => boolean
	listRooms: () => RoomSummary[]
	getCurrentRoomId: () => string | null
	teleportAvatarTo: (x: number, y: number) => boolean
	emitSmokeAtPrimaryAvatar: (tint?: number, count?: number) => boolean
	placeHabboFurni: (className: string, options?: { x?: number; y?: number; direction?: number; label?: string; width?: number; depth?: number }) => boolean
	rotateFurnitureById: (id: string) => number | null
	moveFurnitureById: (id: string, x: number, y: number) => boolean
	removeFurnitureById?: (id: string) => boolean
	setAvatarMovementEnabled: (enabled: boolean) => void
	setPrimaryAvatarFigurestring?: (figure: string) => boolean
	setPrimaryAvatarUsername?: (name: string) => boolean
	getPrimaryAvatarScreenPosition?: () => { x: number; y: number } | null
	gangState: GangStateLike
	destroy?: () => void
}

type InventoryItem = {
	uid: string
	className: string
	name: string
	xdim: number
	ydim: number
	icon: string | null
	category: string | null
}

type WorldChatBubble = {
	id: string
	author: string
	text: string
	x: number
	y: number
	createdAt: number
}

const WORLD_CHAT_BUBBLE_DURATION = 5000

type TileTapDetail = {
	x: number
	y: number
	height: number
}

type PlacementState = {
	id: string
	label: string
	habboClassName: string | null
	originX: number
	originY: number
	currentX: number
	currentY: number
}

type FurnitureTapDetail = {
	id: string
	label: string
	kind: string
	x: number
	y: number
	width: number
	depth: number
	height: number
	walkable: boolean
	habboClassName: string | null
	habboDirection: number | null
	clientX: number
	clientY: number
}

const SIT_KINDS = new Set([
	"sofa",
	"chill-sofa",
	"chair",
	"throne",
	"bar"
])

const LIE_KINDS = new Set(["bed"])

type HabboCatalogEntry = {
	id: number
	className: string
	category: string | null
	furniline: string | null
	xdim: number
	ydim: number
	name: string
	description: string
	hasSwf: boolean
	icon: string | null
}

type PanelKey = "rooms" | "wardrobe" | "shop" | "inventory" | "admin" | "gangs" | "chat" | null
type GangTab = "crew" | "stock" | "deals" | "chat" | "rivalries"

const FACTIONS: Array<{ id: FactionId; name: string; color: string; tagline: string }> = [
	{ id: "blonds", name: "Les Blonds", color: "#d9a54a", tagline: "Old school · or" },
	{ id: "bmf", name: "BMF", color: "#c8313f", tagline: "Cash · respect" },
	{ id: "vagos", name: "Vagos", color: "#d9a02d", tagline: "Desert · bikes" },
	{ id: "crips", name: "Crips", color: "#2f5fa6", tagline: "Blue flag" },
	{ id: "motards", name: "Motards", color: "#232323", tagline: "Chrome · feu" },
	{ id: "quebec", name: "Québec", color: "#4f8ba7", tagline: "Froid · QC" }
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

const DRUG_LABELS: Record<DrugType, { name: string; emoji: string; tint: number }> = {
	weed: { name: "Weed", emoji: "🌿", tint: 0xa9ffbe },
	coke: { name: "Cocaïne", emoji: "❄️", tint: 0xffffff },
	ecsta: { name: "Ecsta", emoji: "💗", tint: 0xff88d4 },
	molly: { name: "Molly", emoji: "💊", tint: 0xd7b7ff }
}

const SMOKE_TINTS = {
	joint: 0xd8d8e2,
	bong: 0xb4e2c5,
	pyrex: 0xd7b7ff
}

function useHabboInstance() {
	const [instance, setInstance] = useState<HabboLike | null>(null)

	useEffect(() => {
		let stopped = false
		const check = () => {
			const w = window as unknown as { __habbo?: HabboLike }
			return w.__habbo ?? null
		}
		const poll = () => {
			if (stopped) return
			const next = check()
			setInstance((prev) => (prev === next ? prev : next))
		}
		poll()
		const id = window.setInterval(poll, 500)
		return () => {
			stopped = true
			window.clearInterval(id)
		}
	}, [])

	return instance
}

function useGangSnapshot(habbo: HabboLike | null): GangSnapshot | null {
	const [snapshot, setSnapshot] = useState<GangSnapshot | null>(null)

	useEffect(() => {
		if (!habbo) return
		setSnapshot(habbo.gangState.getSnapshot())
		const unsubscribe = habbo.gangState.subscribe(() => {
			setSnapshot(habbo.gangState.getSnapshot())
		})
		return unsubscribe
	}, [habbo])

	return snapshot
}

function formatTime(at: number): string {
	const d = new Date(at)
	return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

export default function ClientGameShell() {
	const gameRootRef = useRef<HTMLDivElement | null>(null)
	const habbo = useHabboInstance()
	const gangSnapshot = useGangSnapshot(habbo)

	const [panel, setPanel] = useState<PanelKey>(null)
	const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
	const [rooms, setRooms] = useState<RoomSummary[]>([])
	const [username, setUsername] = useState<string>("")
	const [teleportX, setTeleportX] = useState("2")
	const [teleportY, setTeleportY] = useState("4")
	const [status, setStatus] = useState<string>("")
	const [interactionOpen, setInteractionOpen] = useState(false)
	const [gangTab, setGangTab] = useState<GangTab>("crew")
	const [chatDraft, setChatDraft] = useState("")
	const [habboCatalog, setHabboCatalog] = useState<HabboCatalogEntry[]>([])
	const [habboQuery, setHabboQuery] = useState("")
	const [habboCategory, setHabboCategory] = useState<string>("all")
	const [habboSwfOnly, setHabboSwfOnly] = useState(true)
	const [furniTap, setFurniTap] = useState<FurnitureTapDetail | null>(null)
	const [placement, setPlacement] = useState<PlacementState | null>(null)
	const [inspector, setInspector] = useState<FurnitureTapDetail | null>(null)
	const [gender, setGender] = useState<Gender>("M")
	const [figureSelection, setFigureSelection] = useState<FigureSelection>(DEFAULT_SELECTION.M)
	const [wardrobePart, setWardrobePart] = useState<FigurePart>("hr")
	const [inventory, setInventory] = useState<InventoryItem[]>([])
	const [dragItemUid, setDragItemUid] = useState<string | null>(null)
	const [dropHover, setDropHover] = useState(false)
	const placementRef = useRef<PlacementState | null>(null)
	const inventoryRef = useRef<InventoryItem[]>(inventory)
	const dragItemRef = useRef<string | null>(null)
	useEffect(() => { placementRef.current = placement }, [placement])
	useEffect(() => { inventoryRef.current = inventory }, [inventory])
	useEffect(() => { dragItemRef.current = dragItemUid }, [dragItemUid])

	useEffect(() => {
		if (typeof window === "undefined") return
		const stored = window.localStorage.getItem("ew-username")
		if (stored) setUsername(stored)
		const storedGender = window.localStorage.getItem("ew-gender") as Gender | null
		if (storedGender === "M" || storedGender === "F") setGender(storedGender)
		const storedFigure = window.localStorage.getItem("ew-figurestring")
		if (storedFigure) {
			setFigureSelection(figurestringToSelection(
				storedFigure,
				DEFAULT_SELECTION[storedGender === "F" ? "F" : "M"]
			))
		}
		try {
			const storedInv = window.localStorage.getItem("ew-inventory")
			if (storedInv) {
				const parsed = JSON.parse(storedInv) as InventoryItem[]
				if (Array.isArray(parsed)) setInventory(parsed)
			}
		} catch {
			/* ignore malformed inventory */
		}
	}, [])

	// Persist inventory whenever it changes so items survive a reload.
	useEffect(() => {
		if (typeof window === "undefined") return
		try {
			window.localStorage.setItem("ew-inventory", JSON.stringify(inventory))
		} catch {
			/* quota — ignore */
		}
	}, [inventory])

	// Seed a small starter inventory once the Habbo catalog is loaded.
	useEffect(() => {
		if (typeof window === "undefined") return
		if (habboCatalog.length === 0) return
		if (inventoryRef.current.length > 0) return
		if (window.localStorage.getItem("ew-inventory-seeded") === "1") return
		const preferred = ["club_sofa", "table_polyfon", "plant_yukka", "shelves_norja", "rare_dragonlamp", "rare_daffodil_rug"]
		const picks = preferred
			.map((cn) => habboCatalog.find((e) => e.className === cn))
			.filter((e): e is HabboCatalogEntry => Boolean(e))
		const fallback = picks.length > 0
			? picks
			: habboCatalog.filter((e) => e.hasSwf).slice(0, 6)
		const seeded: InventoryItem[] = fallback.map((entry, i) => ({
			uid: `inv-${Date.now()}-${i}`,
			className: entry.className,
			name: entry.name || entry.className,
			xdim: entry.xdim,
			ydim: entry.ydim,
			icon: entry.icon,
			category: entry.category
		}))
		setInventory(seeded)
		window.localStorage.setItem("ew-inventory-seeded", "1")
	}, [habboCatalog])

	useEffect(() => {
		if (!habbo || !username) return
		habbo.gangState.setPlayerName(username)
		habbo.setPrimaryAvatarUsername?.(username)
	}, [habbo, username])

	// Keep the in-world avatar's figurestring in sync with the wardrobe state.
	const figurestring = useMemo(
		() => selectionToFigurestring(figureSelection),
		[figureSelection]
	)
	const figurePreviewUrl = useMemo(
		() => previewAvatarUrl(figurestring, 2, "l"),
		[figurestring]
	)

	useEffect(() => {
		if (!habbo) return
		if (!figurestring) return
		let tries = 0
		const apply = () => {
			if (habbo.setPrimaryAvatarFigurestring?.(figurestring)) return
			if (tries++ > 20) return
			window.setTimeout(apply, 120)
		}
		apply()
	}, [habbo, figurestring])

	useEffect(() => {
		if (typeof window === "undefined") return
		window.localStorage.setItem("ew-figurestring", figurestring)
		window.localStorage.setItem("ew-gender", gender)
	}, [figurestring, gender])

	useEffect(() => {
		if (typeof window === "undefined") return
		let cancelled = false
		fetch("/data/habbo/catalog.json", { cache: "force-cache" })
			.then((r) => (r.ok ? r.json() : null))
			.then((data: { furni?: HabboCatalogEntry[] } | null) => {
				if (cancelled || !data?.furni) return
				setHabboCatalog(data.furni)
			})
			.catch(() => { /* optional */ })
		return () => { cancelled = true }
	}, [])

	useEffect(() => {
		if (!habbo) return
		setRooms(habbo.listRooms())
		setCurrentRoomId(habbo.getCurrentRoomId())

		const onChange = (event: Event) => {
			const detail = (event as CustomEvent<{ id: string }>).detail
			setCurrentRoomId(detail?.id ?? habbo.getCurrentRoomId())
			setFurniTap(null)
			setPlacement(null)
			setInspector(null)
			habbo.setAvatarMovementEnabled(true)
		}
		window.addEventListener("ew-room-change", onChange)
		return () => window.removeEventListener("ew-room-change", onChange)
	}, [habbo])

	useEffect(() => {
		if (typeof window === "undefined") return
		const onTap = (event: Event) => {
			const detail = (event as CustomEvent<FurnitureTapDetail>).detail
			if (!detail) return
			if (placementRef.current) return
			setFurniTap(detail)
		}
		window.addEventListener("ew-furniture-tap", onTap)
		return () => window.removeEventListener("ew-furniture-tap", onTap)
	}, [])

	useEffect(() => {
		if (typeof window === "undefined" || !habbo) return
		const onTileTap = (event: Event) => {
			const detail = (event as CustomEvent<TileTapDetail>).detail
			if (!detail || !placement) return
			if (habbo.moveFurnitureById(placement.id, detail.x, detail.y)) {
				setPlacement({ ...placement, currentX: detail.x, currentY: detail.y })
			}
		}
		window.addEventListener("ew-tile-tap", onTileTap)
		return () => window.removeEventListener("ew-tile-tap", onTileTap)
	}, [habbo, placement])

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

	const flashStatus = useCallback((text: string) => {
		setStatus(text)
		setTimeout(() => setStatus(""), 1800)
	}, [])

	const handleSmoke = useCallback(
		(source: "joint" | "bong" | "pyrex") => {
			if (!habbo) return
			const tint = SMOKE_TINTS[source]
			const count = source === "pyrex" ? 28 : source === "bong" ? 22 : 14
			habbo.emitSmokeAtPrimaryAvatar(tint, count)
			flashStatus(
				source === "joint"
					? "Joint allumé · boucane 🌬️"
					: source === "bong"
						? "Un gros coup de bong 💨"
						: "Pyrex bouillant 🧪"
			)
			setInteractionOpen(false)
		},
		[habbo, flashStatus]
	)

	const handleJoinFaction = useCallback(
		(id: FactionId) => {
			if (!habbo) return
			habbo.gangState.joinFaction(id)
			handleSwitchRoom(`gang-${id}`)
			flashStatus(`Tu as rejoint ${FACTIONS.find((f) => f.id === id)?.name ?? id}.`)
		},
		[habbo, handleSwitchRoom, flashStatus]
	)

	const handleProduce = useCallback(
		(drug: DrugType) => {
			if (!habbo || !gangSnapshot?.playerFaction) return
			habbo.gangState.produce(gangSnapshot.playerFaction, drug, 2)
			habbo.emitSmokeAtPrimaryAvatar(DRUG_LABELS[drug].tint, 20)
			flashStatus(`Production : +2 ${DRUG_LABELS[drug].name}`)
		},
		[habbo, gangSnapshot, flashStatus]
	)

	const handleSell = useCallback(
		(drug: DrugType) => {
			if (!habbo || !gangSnapshot?.playerFaction) return
			if (habbo.gangState.sell(gangSnapshot.playerFaction, drug, 1)) {
				flashStatus(`Vendu 1 ${DRUG_LABELS[drug].name} au marché noir`)
			} else {
				flashStatus("Stock insuffisant")
			}
		},
		[habbo, gangSnapshot, flashStatus]
	)

	const handleAttack = useCallback(
		(target: FactionId) => {
			if (!habbo || !gangSnapshot?.playerFaction) return
			const success = habbo.gangState.attack(gangSnapshot.playerFaction, target)
			flashStatus(success ? "Raid réussi · cash confisqué" : "Raid raté · respect perdu")
		},
		[habbo, gangSnapshot, flashStatus]
	)

	const handleSendChat = useCallback(() => {
		if (!habbo || !gangSnapshot?.playerFaction || !chatDraft.trim()) return
		habbo.gangState.chat(gangSnapshot.playerFaction, gangSnapshot.playerName || "Anon", chatDraft.trim())
		setChatDraft("")
	}, [habbo, gangSnapshot, chatDraft])

	const togglePanel = (key: Exclude<PanelKey, null>) => {
		setPanel((current) => (current === key ? null : key))
	}

	const handleFurniSit = useCallback(() => {
		if (!habbo || !furniTap) return
		const cx = furniTap.x + furniTap.width / 2
		const cy = furniTap.y + furniTap.depth / 2
		if (habbo.teleportAvatarTo(cx, cy)) {
			const label = LIE_KINDS.has(furniTap.kind)
				? `Tu te couches sur ${furniTap.label.toLowerCase()}`
				: `Tu t'assois sur ${furniTap.label.toLowerCase()}`
			flashStatus(label)
		}
		setFurniTap(null)
	}, [habbo, furniTap, flashStatus])

	const handleFurniTurn = useCallback(() => {
		if (!habbo || !furniTap) return
		if (!furniTap.habboClassName) {
			flashStatus("Cet objet ne peut pas tourner.")
			return
		}
		const next = habbo.rotateFurnitureById(furniTap.id)
		if (next === null) {
			flashStatus("Rotation impossible.")
			return
		}
		flashStatus(`${furniTap.label} · direction ${next}`)
		setFurniTap((prev) => (prev ? { ...prev, habboDirection: next } : prev))
	}, [habbo, furniTap, flashStatus])

	const handleFurniClose = useCallback(() => setFurniTap(null), [])

	const [worldBubbles, setWorldBubbles] = useState<WorldChatBubble[]>([])
	const bubbleIdRef = useRef(0)

	const handleSendWorldChat = useCallback(
		async (message: string) => {
			const trimmed = message.trim()
			if (!trimmed) return
			const anchor = habbo?.getPrimaryAvatarScreenPosition?.() ?? null
			if (!anchor) {
				flashStatus("Avatar indisponible")
				return
			}
			bubbleIdRef.current += 1
			const bubble: WorldChatBubble = {
				id: `local-${Date.now()}-${bubbleIdRef.current}`,
				author: username || "Invité",
				text: trimmed.slice(0, 90),
				x: anchor.x,
				y: anchor.y,
				createdAt: Date.now()
			}
			setWorldBubbles((prev) => {
				const fresh = prev.filter((b) => Date.now() - b.createdAt < WORLD_CHAT_BUBBLE_DURATION)
				const dedupedByAuthor = fresh.filter((b) => b.author !== bubble.author)
				return [...dedupedByAuthor, bubble]
			})

			// Best-effort persistence to Firestore — fire-and-forget so the
			// chat input re-enables as soon as the bubble is added locally,
			// even if Firestore is slow or unreachable.
			void (async () => {
				try {
					const roomId = habbo?.getCurrentRoomId?.() ?? null
					if (!roomId) return
					const { getFirebaseDb } = await import("@/lib/firebase/client")
					const db = getFirebaseDb()
					if (!db) return
					const { initializeChatService } = await import("@/lib/chat/ChatService")
					const chat = initializeChatService(db)
					await chat.sendMessage(roomId, username || "guest", username || "Invité", trimmed)
				} catch (error) {
					if (process.env.NODE_ENV !== "production") {
						console.warn("world chat persistence skipped:", error)
					}
				}
			})()
		},
		[habbo, username, flashStatus]
	)

	useEffect(() => {
		if (worldBubbles.length === 0) return
		const interval = window.setInterval(() => {
			setWorldBubbles((prev) => prev.filter((b) => Date.now() - b.createdAt < WORLD_CHAT_BUBBLE_DURATION))
		}, 500)
		return () => window.clearInterval(interval)
	}, [worldBubbles.length])

	// Re-anchor local bubbles to the primary avatar every frame so bubbles
	// follow the avatar while it walks instead of staying pinned to the click
	// position.
	useEffect(() => {
		if (!habbo) return
		if (worldBubbles.length === 0) return
		const localAuthor = username || "Invité"
		let frame = 0
		const tick = (): void => {
			const anchor = habbo.getPrimaryAvatarScreenPosition?.()
			if (anchor) {
				setWorldBubbles((prev) => {
					let dirty = false
					const next = prev.map((b) => {
						if (b.author !== localAuthor) return b
						if (b.x === anchor.x && b.y === anchor.y) return b
						dirty = true
						return { ...b, x: anchor.x, y: anchor.y }
					})
					return dirty ? next : prev
				})
			}
			frame = window.requestAnimationFrame(tick)
		}
		frame = window.requestAnimationFrame(tick)
		return () => window.cancelAnimationFrame(frame)
	}, [habbo, worldBubbles.length, username])

	const handleFurniMove = useCallback(() => {
		if (!habbo || !furniTap) return
		if (!furniTap.habboClassName) {
			flashStatus("Cet objet n'est pas encore déplaçable.")
			return
		}
		setPlacement({
			id: furniTap.id,
			label: furniTap.label,
			habboClassName: furniTap.habboClassName,
			originX: furniTap.x,
			originY: furniTap.y,
			currentX: furniTap.x,
			currentY: furniTap.y
		})
		habbo.setAvatarMovementEnabled(false)
		setFurniTap(null)
		flashStatus(`Déplacement · tape une case pour poser ${furniTap.label}`)
	}, [habbo, furniTap, flashStatus])

	const handlePlacementConfirm = useCallback(() => {
		if (!habbo || !placement) return
		habbo.setAvatarMovementEnabled(true)
		flashStatus(`${placement.label} placé à (${placement.currentX}, ${placement.currentY})`)
		setPlacement(null)
	}, [habbo, placement, flashStatus])

	const handlePlacementCancel = useCallback(() => {
		if (!habbo || !placement) return
		if (placement.originX !== placement.currentX || placement.originY !== placement.currentY) {
			habbo.moveFurnitureById(placement.id, placement.originX, placement.originY)
		}
		habbo.setAvatarMovementEnabled(true)
		flashStatus("Placement annulé")
		setPlacement(null)
	}, [habbo, placement, flashStatus])

	const handleFurniInspect = useCallback(() => {
		if (!furniTap) return
		setInspector(furniTap)
		setFurniTap(null)
	}, [furniTap])

	const handleInspectClose = useCallback(() => setInspector(null), [])

	const getSets = useCallback((part: FigurePart, g: Gender) => {
		switch (part) {
			case "hr":
				return HAIRS[g]
			case "hd":
				return HEADS[g]
			case "ch":
				return SHIRTS[g]
			case "lg":
				return PANTS[g]
			case "sh":
				return SHOES
			default:
				return HAIRS[g]
		}
	}, [])

	const handleGenderChange = useCallback((next: Gender) => {
		setGender(next)
		setFigureSelection((prev) => {
			const fresh = DEFAULT_SELECTION[next]
			// keep colours if possible, swap in gender-specific default sets
			return {
				hr: { set: fresh.hr.set, color1: prev.hr.color1 },
				hd: { set: fresh.hd.set, color1: prev.hd.color1 },
				ch: { set: fresh.ch.set, color1: prev.ch.color1 },
				lg: { set: fresh.lg.set, color1: prev.lg.color1 },
				sh: { set: fresh.sh.set, color1: prev.sh.color1 },
				ha: fresh.ha,
				fa: fresh.fa
			}
		})
	}, [])

	const pickFigurePart = useCallback((part: FigurePart, setId: number) => {
		setFigureSelection((prev) => ({
			...prev,
			[part]: { ...prev[part], set: setId }
		}))
	}, [])

	const pickFigureColor = useCallback((part: FigurePart, colorId: number) => {
		setFigureSelection((prev) => ({
			...prev,
			[part]: { ...prev[part], color1: colorId }
		}))
	}, [])

	const handleInventoryPlace = useCallback(
		(item: InventoryItem, x?: number, y?: number) => {
			if (!habbo) return
			const placeX = typeof x === "number" ? x : 3
			const placeY = typeof y === "number" ? y : 3
			const ok = habbo.placeHabboFurni(item.className, {
				x: placeX,
				y: placeY,
				width: item.xdim,
				depth: item.ydim,
				label: item.name
			})
			if (ok) {
				setInventory((prev) => prev.filter((i) => i.uid !== item.uid))
				flashStatus(`${item.name} posé dans la chambre — clique pour le déplacer`)
				setPanel(null)
			} else {
				flashStatus("Impossible de poser cet objet ici.")
			}
		},
		[habbo, flashStatus]
	)

	// Drag & drop: allow the inventory slots to be dropped onto the game canvas.
	useEffect(() => {
		if (typeof window === "undefined") return
		const root = gameRootRef.current
		if (!root) return
		const onDragOver = (e: DragEvent) => {
			if (!dragItemRef.current) return
			e.preventDefault()
			if (e.dataTransfer) e.dataTransfer.dropEffect = "move"
			setDropHover(true)
		}
		const onDragLeave = () => setDropHover(false)
		const onDrop = (e: DragEvent) => {
			e.preventDefault()
			setDropHover(false)
			const uid = e.dataTransfer?.getData("text/ew-inventory") || dragItemRef.current
			if (!uid) return
			const item = inventoryRef.current.find((i) => i.uid === uid)
			if (!item) return
			handleInventoryPlace(item)
			setDragItemUid(null)
		}
		root.addEventListener("dragover", onDragOver)
		root.addEventListener("dragleave", onDragLeave)
		root.addEventListener("drop", onDrop)
		return () => {
			root.removeEventListener("dragover", onDragOver)
			root.removeEventListener("dragleave", onDragLeave)
			root.removeEventListener("drop", onDrop)
		}
	}, [handleInventoryPlace])

	const handleFurniPickup = useCallback(() => {
		if (!habbo || !furniTap) return
		if (!furniTap.habboClassName) {
			flashStatus("Cet objet ne peut pas être ramassé.")
			return
		}
		const removed = habbo.removeFurnitureById?.(furniTap.id) ?? false
		if (!removed) {
			flashStatus("Ramassage impossible.")
			return
		}
		setInventory((prev) => [
			...prev,
			{
				uid: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				className: furniTap.habboClassName!,
				name: furniTap.label,
				xdim: Math.max(1, Math.round(furniTap.width)),
				ydim: Math.max(1, Math.round(furniTap.depth)),
				icon: null,
				category: null
			}
		])
		flashStatus(`${furniTap.label} rangé dans l'inventaire`)
		setFurniTap(null)
	}, [habbo, furniTap, flashStatus])

	const gangRooms = rooms.filter((r) => r.category === "gang")
	const shopRooms = rooms.filter((r) => r.category === "shop")
	const mainRooms = rooms.filter((r) => r.category !== "gang" && r.category !== "shop")

	const playerGang = gangSnapshot && gangSnapshot.playerFaction
		? gangSnapshot.gangs[gangSnapshot.playerFaction]
		: null

	return (
		<div className="ew-client-shell">
			<div
				id="etherworld-game-root"
				ref={gameRootRef}
				className={`ew-client-canvas-root ${dropHover ? "drop-active" : ""}`}
			/>

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
					{playerGang ? <span className="ew-client-gang-chip">{playerGang.name}</span> : null}
				</div>
			</div>

			{status ? <div className="ew-client-status">{status}</div> : null}

			{furniTap ? (
				<FurnitureActionMenu
					detail={furniTap}
					onSit={handleFurniSit}
					onTurn={handleFurniTurn}
					onMove={handleFurniMove}
					onPickup={handleFurniPickup}
					onInspect={handleFurniInspect}
					onClose={handleFurniClose}
				/>
			) : null}

			{placement ? (
				<FurniturePlacementBar
					placement={placement}
					onConfirm={handlePlacementConfirm}
					onCancel={handlePlacementCancel}
				/>
			) : null}

			{inspector ? (
				<FurnitureInspectDialog
					detail={inspector}
					onClose={handleInspectClose}
				/>
			) : null}

			<WorldChatOverlay
				bubbles={worldBubbles}
				onSend={handleSendWorldChat}
			/>

			<button
				className="ew-client-action-bubble"
				onClick={() => setInteractionOpen((v) => !v)}
				aria-label="Ouvrir actions avatar"
			>
				<span>🕺</span>
			</button>

			{interactionOpen ? (
				<div className="ew-interaction-menu">
					<button onClick={() => handleSmoke("joint")}>
						<span>🚬</span>
						<div>
							<div className="ew-interaction-title">Fumer un joint</div>
							<div className="ew-interaction-sub">Boucane légère</div>
						</div>
					</button>
					<button onClick={() => handleSmoke("bong")}>
						<span>💨</span>
						<div>
							<div className="ew-interaction-title">Coup de bong</div>
							<div className="ew-interaction-sub">Grosse bouffée verte</div>
						</div>
					</button>
					<button onClick={() => handleSmoke("pyrex")}>
						<span>🧪</span>
						<div>
							<div className="ew-interaction-title">Pyrex</div>
							<div className="ew-interaction-sub">Vapeurs violettes · labo</div>
						</div>
					</button>
					<button onClick={() => { flashStatus("Salut ✋"); setInteractionOpen(false) }}>
						<span>✋</span>
						<div>
							<div className="ew-interaction-title">Saluer</div>
							<div className="ew-interaction-sub">Hey crew</div>
						</div>
					</button>
					<button onClick={() => { flashStatus("On danse 💃"); setInteractionOpen(false) }}>
						<span>💃</span>
						<div>
							<div className="ew-interaction-title">Danser</div>
							<div className="ew-interaction-sub">Move le crew</div>
						</div>
					</button>
				</div>
			) : null}

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
								<RoomGroup title="Shops & publics" rooms={shopRooms} currentId={currentRoomId} onPick={handleSwitchRoom} />
								<RoomGroup title="Planques & underground" rooms={gangRooms} currentId={currentRoomId} onPick={handleSwitchRoom} />
							</div>
						) : null}

						{panel === "wardrobe" ? (
							<div className="ew-panel-body">
								<div className="ew-wardrobe-layout">
									<div className="ew-wardrobe-preview">
										<img
											src={figurePreviewUrl}
											alt="Aperçu avatar"
											referrerPolicy="no-referrer"
										/>
										<div className="ew-char-gender">
											<button
												type="button"
												className={`ew-char-gender-btn ${gender === "M" ? "active" : ""}`}
												onClick={() => handleGenderChange("M")}
											>
												<span>♂</span> Homme
											</button>
											<button
												type="button"
												className={`ew-char-gender-btn ${gender === "F" ? "active" : ""}`}
												onClick={() => handleGenderChange("F")}
											>
												<span>♀</span> Femme
											</button>
										</div>
										<div className="ew-wardrobe-figure">{figurestring}</div>
									</div>
									<div className="ew-wardrobe-editor">
										<div className="ew-char-tabs">
											{(["hr", "hd", "ch", "lg", "sh"] as FigurePart[]).map((key) => (
												<button
													key={key}
													type="button"
													className={`ew-char-tab ${wardrobePart === key ? "active" : ""}`}
													onClick={() => setWardrobePart(key)}
												>
													<span className="ew-char-tab-emoji">{wardrobeTabEmoji(key)}</span>
													<span className="ew-char-tab-label">{wardrobeTabLabel(key)}</span>
												</button>
											))}
										</div>
										<div className="ew-char-sets">
											{getSets(wardrobePart, gender).map((set) => (
												<button
													key={set.id}
													type="button"
													className={`ew-char-set ${figureSelection[wardrobePart].set === set.id ? "active" : ""}`}
													onClick={() => pickFigurePart(wardrobePart, set.id)}
												>
													{set.label}
												</button>
											))}
										</div>
										<div className="ew-char-palette">
											{FIGURE_PALETTE.map((color) => (
												<button
													key={color.id}
													type="button"
													className={`ew-char-swatch ${figureSelection[wardrobePart].color1 === color.id ? "active" : ""}`}
													style={{ background: color.hex }}
													onClick={() => pickFigureColor(wardrobePart, color.id)}
													aria-label={color.label}
													title={color.label}
												/>
											))}
										</div>
									</div>
								</div>
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
								<div className="ew-inventory-toolbar">
									<div className="ew-inventory-toolbar-title">Mes meubles ({inventory.length})</div>
									<div className="ew-inventory-hint">
										Glisse un meuble sur la chambre, ou clique pour le poser.
									</div>
								</div>
								{inventory.length === 0 ? (
									<div className="ew-inventory-empty">
										Ton inventaire est vide. Ouvre l&apos;onglet Admin → Catalogue Habbo pour en ajouter.
									</div>
								) : (
									<div className="ew-inventory-grid">
										{inventory.map((item) => (
											<div
												key={item.uid}
												className={`ew-inventory-slot ${dragItemUid === item.uid ? "dragging" : ""}`}
												draggable
												onDragStart={(e) => {
													e.dataTransfer.setData("text/ew-inventory", item.uid)
													e.dataTransfer.effectAllowed = "move"
													setDragItemUid(item.uid)
												}}
												onDragEnd={() => {
													setDragItemUid(null)
													setDropHover(false)
												}}
												onClick={() => handleInventoryPlace(item)}
												title={`${item.name} · ${item.xdim}×${item.ydim} — clique ou glisse pour placer`}
											>
												<div className="ew-inventory-icon">
													{item.icon ? (
														<img
															src={item.icon}
															alt=""
															referrerPolicy="no-referrer"
															onError={(e) => {
																(e.currentTarget as HTMLImageElement).style.visibility = "hidden"
															}}
														/>
													) : (
														<div className="ew-inventory-icon-fallback" />
													)}
												</div>
												<div className="ew-inventory-name">{item.name}</div>
												<div className="ew-inventory-qty">{item.xdim}×{item.ydim}</div>
											</div>
										))}
									</div>
								)}
								{playerGang ? (
									<>
										<div className="ew-inventory-toolbar" style={{ marginTop: 22 }}>
											<div className="ew-inventory-toolbar-title">Stock crew · {playerGang.name}</div>
										</div>
										<div className="ew-stock-grid">
											{(Object.keys(DRUG_LABELS) as DrugType[]).map((drug) => (
												<div key={drug} className="ew-stock-card">
													<div className="ew-stock-emoji">{DRUG_LABELS[drug].emoji}</div>
													<div className="ew-stock-name">{DRUG_LABELS[drug].name}</div>
													<div className="ew-stock-qty">{playerGang.stock[drug]} u.</div>
													<div className="ew-stock-price">
														{gangSnapshot?.prices[drug] ?? 0}$ / u.
													</div>
												</div>
											))}
										</div>
									</>
								) : null}
							</div>
						) : null}

						{panel === "gangs" && gangSnapshot ? (
							<div className="ew-panel-body">
								<div className="ew-faction-rail">
									{FACTIONS.map((f) => {
										const record = gangSnapshot.gangs[f.id]
										const active = gangSnapshot.playerFaction === f.id
										return (
											<button
												key={f.id}
												className={`ew-faction-card ${active ? "selected" : ""}`}
												onClick={() => handleJoinFaction(f.id)}
												style={{ borderColor: f.color }}
											>
												<div className="ew-faction-swatch" style={{ background: f.color }} />
												<div className="ew-faction-info">
													<div className="ew-faction-name">{f.name}</div>
													<div className="ew-faction-sub">{f.tagline}</div>
													<div className="ew-faction-stats">
														<span>💰 {record.cash}$</span>
														<span>⭐ {record.respect}</span>
														<span>🔥 {record.heat}</span>
													</div>
												</div>
												{active ? <div className="ew-card-tag">CREW</div> : null}
											</button>
										)
									})}
								</div>

								<div className="ew-gang-tabs">
									{(["crew", "stock", "deals", "chat", "rivalries"] as GangTab[]).map((t) => (
										<button
											key={t}
											className={`ew-gang-tab ${gangTab === t ? "active" : ""}`}
											onClick={() => setGangTab(t)}
										>
											{tabLabel(t)}
										</button>
									))}
								</div>

								{!playerGang ? (
									<div className="ew-empty-slot">
										Choisis une faction au-dessus pour activer les mécaniques (production, ventes, chat crew, rivalités).
									</div>
								) : (
									<div className="ew-gang-tab-body">
										{gangTab === "crew" ? (
											<div className="ew-roster">
												<h4>Roster {playerGang.name}</h4>
												<ul>
													{playerGang.members.map((m, i) => (
														<li key={m + i}>
															<span className="ew-roster-role">{i === 0 ? "Don" : i === 1 ? "Capo" : "Soldat"}</span>
															<span className="ew-roster-name">{m}</span>
														</li>
													))}
												</ul>
												<div className="ew-roster-meta">
													<span>💰 {playerGang.cash}$</span>
													<span>⭐ {playerGang.respect} respect</span>
													<span>🔥 {playerGang.heat} heat</span>
												</div>
											</div>
										) : null}

										{gangTab === "stock" ? (
											<div className="ew-stock-grid">
												{(Object.keys(DRUG_LABELS) as DrugType[]).map((drug) => (
													<div key={drug} className="ew-stock-card">
														<div className="ew-stock-emoji">{DRUG_LABELS[drug].emoji}</div>
														<div className="ew-stock-name">{DRUG_LABELS[drug].name}</div>
														<div className="ew-stock-qty">{playerGang.stock[drug]} u.</div>
														<div className="ew-stock-price">
															{gangSnapshot.prices[drug]}$ / u.
														</div>
														<div className="ew-stock-actions">
															<button onClick={() => handleProduce(drug)}>+2 labo</button>
															<button onClick={() => handleSell(drug)} disabled={playerGang.stock[drug] < 1}>Vendre ×1</button>
														</div>
													</div>
												))}
											</div>
										) : null}

										{gangTab === "deals" ? (
											<div className="ew-deals">
												{gangSnapshot.deals.length === 0 ? (
													<div className="ew-empty-slot">Pas encore de deal. Lance une production ou une vente.</div>
												) : (
													<ul>
														{gangSnapshot.deals.slice(0, 30).map((d) => (
															<li key={d.id} className={`ew-deal-line kind-${d.kind}`}>
																<span className="ew-deal-time">{formatTime(d.at)}</span>
																<span className="ew-deal-faction">{gangSnapshot.gangs[d.factionId]?.name ?? d.factionId}</span>
																<span className="ew-deal-text">{d.text}</span>
															</li>
														))}
													</ul>
												)}
											</div>
										) : null}

										{gangTab === "chat" ? (
											<div className="ew-chat">
												<div className="ew-chat-log">
													{gangSnapshot.chat
														.filter((m) => m.factionId === playerGang.id)
														.slice(-40)
														.map((m) => (
															<div key={m.id} className="ew-chat-line">
																<span className="ew-chat-time">{formatTime(m.at)}</span>
																<span className="ew-chat-author">{m.author} :</span>
																<span className="ew-chat-text">{m.text}</span>
															</div>
														))}
													{gangSnapshot.chat.filter((m) => m.factionId === playerGang.id).length === 0 ? (
														<div className="ew-empty-slot">Ouvre la discussion crew.</div>
													) : null}
												</div>
												<div className="ew-chat-input">
													<input
														value={chatDraft}
														onChange={(e) => setChatDraft(e.target.value)}
														placeholder="Message pour le crew…"
														onKeyDown={(e) => {
															if (e.key === "Enter") handleSendChat()
														}}
													/>
													<button onClick={handleSendChat}>Envoyer</button>
												</div>
											</div>
										) : null}

										{gangTab === "rivalries" ? (
											<div className="ew-rivalries">
												{FACTIONS.filter((f) => f.id !== playerGang.id).map((f) => {
													const target = gangSnapshot.gangs[f.id]
													const ratio = Math.round((playerGang.respect / Math.max(1, target.respect)) * 100)
													const rival = gangSnapshot.rivalries[playerGang.id] === f.id
													return (
														<div key={f.id} className={`ew-rival-card ${rival ? "at-war" : ""}`} style={{ borderColor: f.color }}>
															<div className="ew-rival-head">
																<span className="ew-rival-name">{f.name}</span>
																{rival ? <span className="ew-rival-war">GUERRE</span> : null}
															</div>
															<div className="ew-rival-stats">
																<span>⭐ {target.respect}</span>
																<span>🔥 {target.heat}</span>
																<span>💰 {target.cash}$</span>
															</div>
															<div className="ew-rival-ratio">
																Respect ratio : <strong>{ratio}%</strong>
															</div>
															<button className="ew-rival-attack" onClick={() => handleAttack(f.id)}>
																Attaquer la planque
															</button>
														</div>
													)
												})}
											</div>
										) : null}
									</div>
								)}
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
									<h3>Force tick gangs</h3>
									<div className="ew-admin-actions">
										<button
											className="ew-admin-chip"
											onClick={() => {
												habbo?.gangState.tick()
												flashStatus("Tick gang forcé")
											}}
										>
											Forcer cycle production
										</button>
									</div>
								</section>

								<section className="ew-admin-block">
									<h3>Stats</h3>
									<div className="ew-admin-row"><span className="ew-admin-label">Rooms totales :</span><span className="ew-admin-value">{rooms.length}</span></div>
									<div className="ew-admin-row"><span className="ew-admin-label">Planques gang :</span><span className="ew-admin-value">{gangRooms.length}</span></div>
									<div className="ew-admin-row"><span className="ew-admin-label">Shops :</span><span className="ew-admin-value">{shopRooms.length}</span></div>
									<div className="ew-admin-row"><span className="ew-admin-label">Catalogue Habbo :</span><span className="ew-admin-value">{habboCatalog.length}</span></div>
								</section>

								<section className="ew-admin-block ew-habbo-catalog-block">
									<h3>Catalogue Habbo officiel</h3>
									<p className="ew-habbo-catalog-hint">
										Clique sur un item pour le poser dans la room courante. Les items marqués{" "}
										<span className="ew-habbo-badge-ok">extrait</span> sont rendus avec les sprites
										Habbo officiels. Sinon, l’icône est placée comme référence en attendant
										l’extraction du SWF correspondant.
									</p>
									<div className="ew-habbo-catalog-filters">
										<input
											className="ew-habbo-search"
											placeholder="Rechercher (nom ou classname)"
											value={habboQuery}
											onChange={(e) => setHabboQuery(e.target.value)}
										/>
										<select
											className="ew-habbo-category"
											value={habboCategory}
											onChange={(e) => setHabboCategory(e.target.value)}
										>
											<option value="all">Toutes catégories</option>
											{Array.from(new Set(habboCatalog.map((e) => e.category || "other")))
												.sort()
												.slice(0, 40)
												.map((cat) => (
													<option key={cat} value={cat}>{cat}</option>
												))}
										</select>
										<label className="ew-habbo-swf-only">
											<input type="checkbox" checked={habboSwfOnly} onChange={(e) => setHabboSwfOnly(e.target.checked)} />
											SWF uniquement
										</label>
									</div>
									<div className="ew-habbo-catalog-grid">
										{habboCatalog
											.filter((e) => {
												if (habboSwfOnly && !e.hasSwf) return false
												if (habboCategory !== "all" && (e.category || "other") !== habboCategory) return false
												if (habboQuery) {
													const q = habboQuery.toLowerCase()
													if (!e.className.toLowerCase().includes(q) && !(e.name || "").toLowerCase().includes(q)) return false
												}
												return true
											})
											.slice(0, 180)
											.map((entry) => (
												<button
													key={entry.id}
													className="ew-habbo-catalog-item"
													title={`${entry.name || entry.className}\n${entry.description || ""}`}
													onClick={() => {
														if (!habbo) return
														const parsedX = Number(teleportX)
														const parsedY = Number(teleportY)
														const ok = habbo.placeHabboFurni(entry.className, {
															x: Number.isFinite(parsedX) ? parsedX : 4,
															y: Number.isFinite(parsedY) ? parsedY : 4,
															width: entry.xdim,
															depth: entry.ydim,
															label: entry.name || entry.className
														})
														flashStatus(ok ? `Posé : ${entry.className}` : `Impossible de poser ${entry.className}`)
													}}
												>
													{entry.icon ? (
														<img
															src={entry.icon}
															alt=""
															className="ew-habbo-catalog-icon"
															onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = "hidden" }}
														/>
													) : (
														<div className="ew-habbo-catalog-icon ew-habbo-icon-fallback" />
													)}
													<div className="ew-habbo-catalog-name">{entry.name || entry.className}</div>
													<div className="ew-habbo-catalog-meta">
														<span>{entry.xdim}×{entry.ydim}</span>
														{entry.hasSwf ? <span className="ew-habbo-badge-ok">swf</span> : null}
													</div>
												</button>
											))}
									</div>
								</section>
							</div>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	)
}

function FurnitureActionMenu({
	detail,
	onSit,
	onTurn,
	onMove,
	onPickup,
	onInspect,
	onClose
}: {
	detail: FurnitureTapDetail
	onSit: () => void
	onTurn: () => void
	onMove: () => void
	onPickup: () => void
	onInspect: () => void
	onClose: () => void
}) {
	const canSit = SIT_KINDS.has(detail.kind)
	const canLie = LIE_KINDS.has(detail.kind)
	const canSeat = canSit || canLie
	const canTurn = detail.habboClassName !== null
	const canMove = detail.habboClassName !== null
	const seatLabel = canLie ? "Se coucher" : "S'asseoir"
	const seatSub = canLie ? "Repos sur le lit" : canSit ? "Pose-toi ici" : "Indisponible"

	const [viewport, setViewport] = useState<{ w: number; h: number }>(() => ({
		w: typeof window === "undefined" ? 1024 : window.innerWidth,
		h: typeof window === "undefined" ? 768 : window.innerHeight
	}))
	const menuRef = useRef<HTMLDivElement | null>(null)
	const [measuredHeight, setMeasuredHeight] = useState<number | null>(null)

	useEffect(() => {
		const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight })
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [])

	useLayoutEffect(() => {
		if (menuRef.current) setMeasuredHeight(menuRef.current.offsetHeight)
	}, [detail.id])

	const menuWidth = 220
	const menuHeight = measuredHeight ?? 400
	const margin = 16
	const left = Math.max(margin, Math.min(detail.clientX - menuWidth / 2, viewport.w - menuWidth - margin))
	const top = Math.max(margin, Math.min(detail.clientY - menuHeight - 12, viewport.h - menuHeight - margin))

	return (
		<div className="ew-furni-menu-backdrop" onClick={onClose}>
			<div
				ref={menuRef}
				className="ew-furni-menu"
				role="dialog"
				aria-label={`Actions pour ${detail.label}`}
				style={{ left, top }}
				onClick={(event) => event.stopPropagation()}
			>
				<div className="ew-furni-menu-head">
					<div className="ew-furni-menu-title">{detail.label}</div>
					<button
						className="ew-furni-menu-close"
						onClick={onClose}
						aria-label="Fermer le menu"
					>
						×
					</button>
				</div>
				<div className="ew-furni-menu-sub">
					{detail.kind} · {detail.width}×{detail.depth}
					{detail.habboClassName ? ` · ${detail.habboClassName}` : ""}
				</div>
				<button
					className="ew-furni-menu-action"
					onClick={onSit}
					disabled={!canSeat}
				>
					<span className="ew-furni-menu-icon">{canLie ? "🛌" : "🪑"}</span>
					<div>
						<div className="ew-furni-menu-action-title">{seatLabel}</div>
						<div className="ew-furni-menu-action-sub">{seatSub}</div>
					</div>
				</button>
				<button
					className="ew-furni-menu-action"
					onClick={onTurn}
					disabled={!canTurn}
				>
					<span className="ew-furni-menu-icon">🔄</span>
					<div>
						<div className="ew-furni-menu-action-title">Tourner</div>
						<div className="ew-furni-menu-action-sub">
							{canTurn ? `Dir. ${detail.habboDirection ?? 2} → ${nextDir(detail.habboDirection ?? 2)}` : "Indisponible"}
						</div>
					</div>
				</button>
				<button
					className="ew-furni-menu-action"
					onClick={onMove}
					disabled={!canMove}
				>
					<span className="ew-furni-menu-icon">✥</span>
					<div>
						<div className="ew-furni-menu-action-title">Déplacer</div>
						<div className="ew-furni-menu-action-sub">
							{canMove ? "Tape une case pour poser" : "Indisponible"}
						</div>
					</div>
				</button>
				<button
					className="ew-furni-menu-action"
					onClick={onPickup}
					disabled={!canMove}
				>
					<span className="ew-furni-menu-icon">🎒</span>
					<div>
						<div className="ew-furni-menu-action-title">Ramasser</div>
						<div className="ew-furni-menu-action-sub">
							{canMove ? "Retour dans l'inventaire" : "Indisponible"}
						</div>
					</div>
				</button>
				<button
					className="ew-furni-menu-action"
					onClick={onInspect}
				>
					<span className="ew-furni-menu-icon">ℹ️</span>
					<div>
						<div className="ew-furni-menu-action-title">Inspecter</div>
						<div className="ew-furni-menu-action-sub">Fiche détaillée</div>
					</div>
				</button>
				<div className="ew-furni-menu-meta">
					<div><span>Case</span><strong>{detail.x}, {detail.y}</strong></div>
					<div><span>Taille</span><strong>{detail.width}×{detail.depth}×{detail.height}</strong></div>
					<div><span>Direction</span><strong>{detail.habboDirection ?? "—"}</strong></div>
				</div>
			</div>
		</div>
	)
}

function nextDir(current: number): number {
	const dirs = [0, 2, 4, 6]
	const i = dirs.indexOf(current)
	return dirs[(i === -1 ? 0 : i + 1) % dirs.length]
}

function FurniturePlacementBar({
	placement,
	onConfirm,
	onCancel
}: {
	placement: PlacementState
	onConfirm: () => void
	onCancel: () => void
}) {
	return (
		<div className="ew-placement-bar" role="dialog" aria-label="Mode déplacement">
			<div className="ew-placement-info">
				<div className="ew-placement-label">{placement.label}</div>
				<div className="ew-placement-sub">
					{placement.originX === placement.currentX && placement.originY === placement.currentY
						? `Tape une case pour déplacer · origine ${placement.originX}, ${placement.originY}`
						: `Case ${placement.currentX}, ${placement.currentY} · origine ${placement.originX}, ${placement.originY}`}
				</div>
			</div>
			<button className="ew-placement-btn ew-placement-cancel" onClick={onCancel}>
				Annuler
			</button>
			<button className="ew-placement-btn ew-placement-confirm" onClick={onConfirm}>
				Confirmer
			</button>
		</div>
	)
}

function FurnitureInspectDialog({
	detail,
	onClose
}: {
	detail: FurnitureTapDetail
	onClose: () => void
}) {
	return (
		<div className="ew-inspect-backdrop" onClick={onClose}>
			<div
				className="ew-inspect-card"
				role="dialog"
				aria-label={`Fiche ${detail.label}`}
				onClick={(event) => event.stopPropagation()}
			>
				<div className="ew-inspect-head">
					<div className="ew-inspect-title">{detail.label}</div>
					<button className="ew-inspect-close" onClick={onClose} aria-label="Fermer">×</button>
				</div>
				<div className="ew-inspect-grid">
					<div><span>Type</span><strong>{detail.kind}</strong></div>
					<div><span>Case</span><strong>{detail.x}, {detail.y}</strong></div>
					<div><span>Taille</span><strong>{detail.width}×{detail.depth}×{detail.height}</strong></div>
					<div><span>Direction</span><strong>{detail.habboDirection ?? "—"}</strong></div>
					<div><span>Walkable</span><strong>{detail.walkable ? "oui" : "non"}</strong></div>
					<div><span>Sprite</span><strong>{detail.habboClassName ?? "polygone"}</strong></div>
				</div>
				<div className="ew-inspect-foot">
					{detail.habboClassName ? "Sprite Habbo pixel-art · pipeline layer-par-layer" : "Rendu procédural · sprite Habbo non configuré"}
				</div>
			</div>
		</div>
	)
}

function panelTitle(panel: Exclude<PanelKey, null>): string {
	switch (panel) {
		case "rooms": return "Navigator · Rooms"
		case "wardrobe": return "Dressing"
		case "shop": return "Shop EtherWorld"
		case "inventory": return "Inventaire & stock"
		case "gangs": return "Factions · production · rivalités"
		case "chat": return "Chat crew"
		case "admin": return "Admin panel"
	}
}

function tabLabel(tab: GangTab): string {
	switch (tab) {
		case "crew": return "Crew"
		case "stock": return "Stock"
		case "deals": return "Deals"
		case "chat": return "Chat"
		case "rivalries": return "Rivalités"
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

function wardrobeTabEmoji(part: FigurePart): string {
	switch (part) {
		case "hr": return "💇"
		case "hd": return "🙂"
		case "ch": return "👕"
		case "lg": return "👖"
		case "sh": return "👟"
		default: return "✨"
	}
}

function wardrobeTabLabel(part: FigurePart): string {
	switch (part) {
		case "hr": return "Cheveux"
		case "hd": return "Visage"
		case "ch": return "Haut"
		case "lg": return "Bas"
		case "sh": return "Chaussures"
		default: return part
	}
}

function WorldChatOverlay({
	bubbles,
	onSend
}: {
	bubbles: WorldChatBubble[]
	onSend: (message: string) => Promise<void>
}) {
	return (
		<>
			{bubbles.map((bubble) => (
				<ChatBubble
					key={bubble.id}
					author={bubble.author}
					message={bubble.text}
					x={bubble.x - 120}
					y={bubble.y - 60}
					duration={WORLD_CHAT_BUBBLE_DURATION}
				/>
			))}
			<ChatInput onSendMessage={onSend} />
		</>
	)
}
