import type { NextFunction, Request, Response } from 'express';

export function extractVersion(defaultVersion = '1') {
	return (req: Request, res: Response, next: NextFunction) => {
		let version = req.headers['x-api-version'];
		if (!version) {
			const accept = req.get('accept') || '';
			const m = accept.match(/application\/vnd\.myapp\.v(\d+)\+json/);
			version = m ? m[1] : undefined;
		}
		req.apiVersion = (version as string) || defaultVersion;
		console.log('version', req.apiVersion);
		next();
	};
}
