import { Request, Response } from 'express';

type ControllerResponse = (req: Request, res: Response) => Promise<Response | undefined> | Promise<void> | void;

interface Controller {
	create: ControllerResponse
	read: ControllerResponse
	update: ControllerResponse
	delete: ControllerResponse
}

export default Controller;