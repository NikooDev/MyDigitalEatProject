import { RequestHandler } from 'express';

interface Middleware {
	get: RequestHandler[]
	post: RequestHandler[]
	put: RequestHandler[]
	delete: RequestHandler[]
}

export default Middleware;