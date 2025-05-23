import type { Content } from 'mailgen';

export function generateVerifyEmailTemplate(code: string): Content {
	return {
		body: {
			name: 'Dear User',
			intro: 'Welcome to AI-Note-App! To complete your registration, please use the one-time code below:',
			table: {
				data: [
					{
						'Your verification code': `${code}`,
					},
				],
			},
			outro: 'This code will expire in 5 minutes. If you did not request this, please ignore this email.',
		},
	};
}
