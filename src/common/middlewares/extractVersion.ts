import type { NextFunction, Request, Response } from 'express';

/**
 * Middleware to extract the API version from the request headers.
 * It first checks the 'X-API-Version' header, and if it's not present,
 * it tries to extract the version from the 'Accept' header using a regex.
 * If no version is found, it defaults to the provided defaultVersion or '1'.
 *
 * @param {string} [defaultVersion='1'] - The default API version to use if none is found.
 * @returns {Function} A middleware function to handle version extraction.
 *
 * @example
 * app.use(extractVersion('2')); // Sets the default version to '2' if not provided
 */
export function extractVersion(defaultVersion = '1') {
	return (req: Request, res: Response, next: NextFunction) => {
		let version = req.headers['x-api-version'];
		if (version && (!/^\d+$/.test(version as string) || version === '0')) {
			return res
				.status(400)
				.json({ error: 'Invalid X-API-Version header format' });
		}

		if (!version) {
			const accept = req.get('accept') || '';
			const m = accept.match(/application\/vnd\.myapp\.v(\d+)\+json/);
			version = m ? m[1] : undefined;
		}
		req.apiVersion = (version as string) || defaultVersion;
		next();
	};
}
