import jwt, { type JwtPayload } from 'jsonwebtoken';
import { CONFIG } from '#app/config';
import { createHttpError } from '../utils/http.util';
import { httpStatus } from './httpstatus';

type GitHubProfile = {
	id: number;
	login: string;
	avatar_url: string;
};

type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
};

export async function getGithubTokenFromCode(code: string): Promise<string> {
	const response = await fetch(
		'https://github.com/login/oauth/access_token',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				client_id: CONFIG.GITHUB.CLIENT_ID,
				client_secret: CONFIG.GITHUB.CLIENT_SECRET,
				code,
				redirect_uri: CONFIG.GITHUB.CALLBACK_URL,
			}),
		},
	);

	const res = await response.json();
	console.log('res: ', res);
	if (res.error) {
		throw createHttpError(httpStatus.BAD_GATEWAY, {
			code: 'BAD GATEWAY',
			message: res?.error_description ?? 'GATEWAY ERROR',
			details: {
				doc: res?.error_uri,
			},
		});
	}

	return res.access_token;
}

export async function getGithubProfileAndEmails(token: string): Promise<{
	id: string;
	username: string;
	avatarUrl: string;
	email: string | undefined;
}> {
	const [profileResponse, emailsResponse] = await Promise.all([
		fetch('https://api.github.com/user', {
			method: 'GET',
			headers: { Authorization: `token ${token}` },
		}),
		fetch('https://api.github.com/user/emails', {
			method: 'GET',
			headers: { Authorization: `token ${token}` },
		}),
	]);

	if (!profileResponse.ok) throw new Error('Failed to fetch GitHub profile');
	if (!emailsResponse.ok) throw new Error('Failed to fetch GitHub emails');

	const profile: GitHubProfile = await profileResponse.json();
	const emails: GitHubEmail[] = await emailsResponse.json();
	console.log('profile: ', profile);
	console.log('emails: ', emails);

	return {
		id: profile.id.toString(),
		username: profile.login,
		avatarUrl: profile.avatar_url,
		email: emails
			.filter((e) => e.verified && e.primary)
			.map((e) => e.email)[0],
	};
}

export function issueGithubState(
	secret: string = CONFIG.GITHUB.STATE_SECRET,
): string {
	return jwt.sign({ ts: Date.now() }, secret, {
		expiresIn: '5m',
	});
}

export function validateGithubState(token: string): JwtPayload | string {
	return jwt.verify(token, CONFIG.GITHUB.STATE_SECRET);
}
