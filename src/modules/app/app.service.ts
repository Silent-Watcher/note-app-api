import type { NextFunction, Request, Response } from 'express';
import { CONFIG } from '#app/config';

/**
 * Interface defining the app service methods.
 */
export interface IAppService {
	appName: string;
}

const createAppService = () => ({
	appName: CONFIG.APP.NAME,
});

export const appService = createAppService();
