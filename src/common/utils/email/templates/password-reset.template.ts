import type { Content } from 'mailgen';

/**
 * Generates a Mailgen-compatible email content object for password reset emails.
 *
 * @param {string} resetUrl - The URL the user should visit to reset their password.
 *   This is typically a link to a frontend route with a token query parameter.
 *
 * @param {string} [userName] - The name of the user to personalize the greeting.
 *   If not provided, the greeting will default to "Dear User".
 */
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
