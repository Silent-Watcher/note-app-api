import crypto from 'node:crypto';

export function getGravatarUrl(email: string, imageSize?: number): string {
	const hash = crypto.createHash('md5').update(email).digest('hex');
	const GRAVATAR_BASE_URL = 'https://www.gravatar.com/avatar';
	return `${GRAVATAR_BASE_URL}/${hash}${imageSize ? `?s=${imageSize}` : ''}`;
}
