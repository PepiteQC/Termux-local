export default interface IEvent<T = unknown> {
	execute(data: T): void | Promise<void>
}
