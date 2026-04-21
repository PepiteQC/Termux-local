import { injectable } from 'inversify'

import IEventsManager from './IEventsManager'
import IEvent from './IEvent'

import { PlayerJoinedEvent, SetRoomEvent } from './eventIndex'

@injectable()
export default class EventsManager implements IEventsManager {
	public events: Map<string, IEvent>

	public constructor() {
		this.events = new Map<string, IEvent>()
		this.fetchEvents()
	}

	private fetchEvents(): void {
		const events = this.getEvents()

		for (const [name, EventClass] of Object.entries(events)) {
			this.events.set(name, new EventClass())
		}
	}

	private getEvents(): Record<string, new () => IEvent> {
		return {
			playerJoined: PlayerJoinedEvent,
			setRoom: SetRoomEvent
		}
	}
}
