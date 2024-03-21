interface ResponseType<T> {
	code: number
	data: T | null
	message: string
}

export default ResponseType;