import { Container, Graphics, Ticker } from 'pixi.js'

type Puff = {
	g: Graphics
	vx: number
	vy: number
	life: number
	max: number
	size: number
}

export default class SmokePuffLayer extends Container {
	private readonly puffs: Puff[] = []
	private readonly ticker: Ticker
	private readonly tickHandler: (t: Ticker) => void

	public constructor() {
		super()
		this.eventMode = 'none'
		this.zIndex = 99999
		this.ticker = Ticker.shared
		this.tickHandler = (t: Ticker) => this.update(t.deltaMS)
		this.ticker.add(this.tickHandler)
	}

	public emitAt(worldX: number, worldY: number, count: number = 14, tint: number = 0xd8d8e2): void {
		for (let i = 0; i < count; i++) {
			const g = new Graphics()
			const size = 6 + Math.random() * 8
			g.circle(0, 0, size).fill({ color: tint, alpha: 0.55 })
			g.position.set(worldX + (Math.random() - 0.5) * 8, worldY - Math.random() * 4)
			this.addChild(g)
			const max = 1500 + Math.random() * 900
			this.puffs.push({
				g,
				vx: (Math.random() - 0.5) * 0.04,
				vy: -0.06 - Math.random() * 0.05,
				life: 0,
				max,
				size
			})
		}
	}

	public override destroy(): void {
		this.ticker.remove(this.tickHandler)
		this.puffs.forEach((p) => p.g.destroy())
		this.puffs.length = 0
		super.destroy()
	}

	private update(deltaMS: number): void {
		for (let i = this.puffs.length - 1; i >= 0; i--) {
			const p = this.puffs[i]
			p.life += deltaMS
			if (p.life >= p.max) {
				p.g.destroy()
				this.puffs.splice(i, 1)
				continue
			}
			p.g.position.x += p.vx * deltaMS
			p.g.position.y += p.vy * deltaMS
			const progress = p.life / p.max
			p.g.alpha = 0.55 * (1 - progress)
			p.g.scale.set(1 + progress * 1.8)
		}
	}
}
