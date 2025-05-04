import type { Content } from 'mailgen';

export function generatePasswordResetEmailTemplate(
	resetUrl: string,
	userName?: string,
): Content {
	return {
		body: {
			name: `${userName ?? 'Dear User'}`,
			intro: 'You have requested to reset your password.',
			action: {
				instructions:
					'Please click the button below to reset your password:',
				button: {
					color: '#1a73e8',
					text: 'Reset your password',
					link: resetUrl,
				},
			},
			outro: 'If you did not request a password reset, you can safely ignore this email. This link will expire in 1 hour.',
		},
	};
}
