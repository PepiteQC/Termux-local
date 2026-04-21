import { GANG_FACTIONS } from '../rooms/data/rooms'
import type { GangFaction, GangFactionId } from '../rooms/data/rooms'

export type DrugType = 'weed' | 'coke' | 'ecsta' | 'molly'

export type GangStock = Record<DrugType, number>

export type GangRecord = {
	id: GangFactionId
	name: string
	members: string[]
	stock: GangStock
	cash: number
	respect: number
	heat: number
}

export type ChatMessage = {
	id: string
	factionId: GangFactionId
	author: string
	text: string
	at: number
}

export type DealLog = {
	id: string
	factionId: GangFactionId
	kind: 'production' | 'sale' | 'heist' | 'war'
	text: string
	at: number
}

export type GangSnapshot = {
	gangs: Record<GangFactionId, GangRecord>
	playerFaction: GangFactionId | null
	playerName: string
	chat: ChatMessage[]
	deals: DealLog[]
	prices: Record<DrugType, number>
	rivalries: Record<GangFactionId, GangFactionId | null>
}

const BASE_PRICES: Record<DrugType, number> = {
	weed: 40,
	coke: 180,
	ecsta: 90,
	molly: 140
}

const FACTION_RIVAL: Record<GangFactionId, GangFactionId | null> = {
	blonds: 'bmf',
	bmf: 'blonds',
	vagos: 'crips',
	crips: 'vagos',
	motards: 'quebec',
	quebec: 'motards'
}

function seedGang(f: GangFaction): GangRecord {
	return {
		id: f.id,
		name: f.name,
		members: [`${f.name} Capo`, `${f.name} Lieutenant`, `${f.name} Soldat`],
		stock: { weed: 12, coke: 4, ecsta: 6, molly: 3 },
		cash: 2400,
		respect: 100,
		heat: 0
	}
}

function clone<T>(v: T): T {
	return JSON.parse(JSON.stringify(v))
}

function now(): number {
	return Date.now()
}

export default class GangState {
	private snapshot: GangSnapshot
	private listeners = new Set<() => void>()
	private tickHandle: ReturnType<typeof setInterval> | null = null

	public constructor() {
		const gangs = {} as Record<GangFactionId, GangRecord>
		for (const f of GANG_FACTIONS) {
			gangs[f.id] = seedGang(f)
		}
		this.snapshot = {
			gangs,
			playerFaction: null,
			playerName: 'EtherUser',
			chat: [],
			deals: [],
			prices: clone(BASE_PRICES),
			rivalries: clone(FACTION_RIVAL)
		}
	}

	public startTicks(): void {
		if (this.tickHandle) return
		this.tickHandle = setInterval(() => this.tick(), 9000)
	}

	public stopTicks(): void {
		if (this.tickHandle) {
			clearInterval(this.tickHandle)
			this.tickHandle = null
		}
	}

	public subscribe(cb: () => void): () => void {
		this.listeners.add(cb)
		return () => this.listeners.delete(cb)
	}

	public getSnapshot(): GangSnapshot {
		return this.snapshot
	}

	public setPlayerName(name: string): void {
		this.snapshot = { ...this.snapshot, playerName: name }
		this.emit()
	}

	public joinFaction(id: GangFactionId): void {
		const previous = this.snapshot.playerFaction
		if (previous === id) return

		const gangs = { ...this.snapshot.gangs }
		if (previous) {
			const prev = gangs[previous]
			gangs[previous] = {
				...prev,
				members: prev.members.filter((m) => m !== this.snapshot.playerName)
			}
		}
		const joined = gangs[id]
		gangs[id] = {
			...joined,
			members: [...new Set([...joined.members, this.snapshot.playerName])]
		}

		this.snapshot = { ...this.snapshot, gangs, playerFaction: id }
		this.pushDeal(id, 'sale', `${this.snapshot.playerName} a rejoint ${joined.name}.`)
		this.emit()
	}

	public produce(factionId: GangFactionId, drug: DrugType, qty: number = 2): boolean {
		const gang = this.snapshot.gangs[factionId]
		if (!gang) return false
		const next: GangRecord = {
			...gang,
			stock: { ...gang.stock, [drug]: gang.stock[drug] + qty },
			heat: Math.min(100, gang.heat + (drug === 'weed' ? 2 : 6))
		}
		this.snapshot = {
			...this.snapshot,
			gangs: { ...this.snapshot.gangs, [factionId]: next }
		}
		this.pushDeal(factionId, 'production', `+${qty} ${drug} produit(s) au laboratoire.`)
		this.emit()
		return true
	}

	public sell(factionId: GangFactionId, drug: DrugType, qty: number = 1): boolean {
		const gang = this.snapshot.gangs[factionId]
		if (!gang || gang.stock[drug] < qty) return false

		const price = this.snapshot.prices[drug] * qty
		const respectGain = Math.round(price / 60)

		const next: GangRecord = {
			...gang,
			stock: { ...gang.stock, [drug]: gang.stock[drug] - qty },
			cash: gang.cash + price,
			respect: gang.respect + respectGain,
			heat: Math.min(100, gang.heat + 3)
		}
		this.snapshot = {
			...this.snapshot,
			gangs: { ...this.snapshot.gangs, [factionId]: next }
		}
		this.pushDeal(factionId, 'sale', `Vendu ${qty} ${drug} · +${price}$ · +${respectGain} respect.`)
		this.emit()
		return true
	}

	public attack(attackerId: GangFactionId, targetId: GangFactionId): boolean {
		const attacker = this.snapshot.gangs[attackerId]
		const target = this.snapshot.gangs[targetId]
		if (!attacker || !target || attackerId === targetId) return false

		const attackRoll = attacker.respect + Math.random() * 150
		const defendRoll = target.respect + Math.random() * 150
		const success = attackRoll > defendRoll

		const gangs = { ...this.snapshot.gangs }
		if (success) {
			const stolen = Math.min(target.cash, 800 + Math.round(Math.random() * 400))
			gangs[attackerId] = {
				...attacker,
				cash: attacker.cash + stolen,
				respect: attacker.respect + 20,
				heat: Math.min(100, attacker.heat + 20)
			}
			gangs[targetId] = {
				...target,
				cash: Math.max(0, target.cash - stolen),
				respect: Math.max(0, target.respect - 18),
				heat: Math.min(100, target.heat + 10)
			}
			this.pushDeal(attackerId, 'heist', `Raid réussi sur ${target.name} · +${stolen}$`)
			this.pushDeal(targetId, 'war', `Attaqués par ${attacker.name} · −${stolen}$`)
		} else {
			gangs[attackerId] = {
				...attacker,
				respect: Math.max(0, attacker.respect - 12),
				heat: Math.min(100, attacker.heat + 16)
			}
			gangs[targetId] = {
				...target,
				respect: target.respect + 8
			}
			this.pushDeal(attackerId, 'war', `Raid raté sur ${target.name} · −12 respect`)
			this.pushDeal(targetId, 'war', `Repoussé l'assaut de ${attacker.name} · +8 respect`)
		}
		this.snapshot = { ...this.snapshot, gangs }
		this.emit()
		return success
	}

	public chat(factionId: GangFactionId, author: string, text: string): boolean {
		if (!text.trim()) return false
		const msg: ChatMessage = {
			id: `msg-${now()}-${Math.random().toString(36).slice(2, 7)}`,
			factionId,
			author,
			text: text.slice(0, 180),
			at: now()
		}
		const chat = [...this.snapshot.chat, msg].slice(-120)
		this.snapshot = { ...this.snapshot, chat }
		this.emit()
		return true
	}

	public tick(): void {
		const gangs = { ...this.snapshot.gangs }
		for (const f of GANG_FACTIONS) {
			const g = gangs[f.id]
			// auto-production gentle per faction drug affinity
			const drug = f.drugs[Math.floor(Math.random() * f.drugs.length)]
			const produced = 1
			gangs[f.id] = {
				...g,
				stock: { ...g.stock, [drug]: g.stock[drug] + produced },
				heat: Math.max(0, g.heat - 1)
			}
		}

		// price drift ±8% per tick
		const prices = { ...this.snapshot.prices }
		;(Object.keys(prices) as DrugType[]).forEach((k) => {
			const base = BASE_PRICES[k]
			const drift = (Math.random() - 0.5) * 0.16
			prices[k] = Math.round(base * (1 + drift))
		})

		this.snapshot = { ...this.snapshot, gangs, prices }
		this.emit()
	}

	private pushDeal(factionId: GangFactionId, kind: DealLog['kind'], text: string): void {
		const log: DealLog = {
			id: `log-${now()}-${Math.random().toString(36).slice(2, 7)}`,
			factionId,
			kind,
			text,
			at: now()
		}
		const deals = [log, ...this.snapshot.deals].slice(0, 60)
		this.snapshot = { ...this.snapshot, deals }
	}

	private emit(): void {
		for (const cb of this.listeners) {
			try {
				cb()
			} catch {
				/* swallow listener errors */
			}
		}
	}
}
