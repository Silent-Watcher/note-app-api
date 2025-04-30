import type { NextFunction, Request, Response, Router } from 'express';
import routerV1 from '#app/api/versions/v1';

/**
 * Loads the appropriate router based on the API version specified in the request.
 *
 * The function selects the router version from the available versions
 * based on the `apiVersion` property in the request. If no version is specified,
 * version '1' will be used as the default. If the specified version doesn't exist,
 * the default version will be used.
 *
 * @param {Router} router - The router to be loaded for versioning.
 * @returns {Function} A middleware function that handles the request based on the selected router version.
 *
 * @example
 * app.use(loadRouter(routerV1));
 */
export function loadRouter(router: Router) {
	const versions: Record<string, Router> = {
		'1': routerV1,
	};
	return (req: Request, res: Response, next: NextFunction) => {
		const v = (req.apiVersion as string) ?? '1';
		const handler = versions[v] ?? versions['1'];
		if (handler) {
			return handler(req, res, next);
		}
	};
}
