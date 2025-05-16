import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '#app/common/utils/logger.util';
import { CONFIG } from '#app/config';
import { isBlocked, recordFailure, resetFailures } from './recaptchaFraud';

/**
 * Possible error codes returned by Google reCAPTCHA.
 */
const zRecaptchaErrorCodes = z.enum([
	'missing-input-secret',
	'invalid-input-secret',
	'missing-input-response',
	'invalid-input-response',
	'bad-request',
	'timeout-or-duplicate',
	'blocked-ip',
]);

/**
 * Schema representing the expected response from Google's reCAPTCHA API.
 */
const zGoogleCaptchaResponse = z.object({
	success: z.boolean(),
	action: z.string().optional(),
	score: z.number().optional(),
	hostname: z.string().optional(),
	'error-codes': z.array(zRecaptchaErrorCodes).optional(),
});

type GoogleCaptchaResponse = z.infer<typeof zGoogleCaptchaResponse>;

/**
 * Verifies a reCAPTCHA token with Google's API.
 *
 * @param token - The reCAPTCHA token received from the client.
 * @param remoteip - The user's IP address to pass to the verification request.
 * @returns A promise that resolves to a structured object containing reCAPTCHA verification results.
 */
export async function verifyWithGoolge(
	token: string,
	remoteip: string,
): Promise<GoogleCaptchaResponse> {
	// Quick fail if this IP is already blocked
	if (await isBlocked(remoteip)) {
		logger.error(`[recaptcha][fraud] request from blocked IP ${remoteip}`);
		return {
			success: false,
			'error-codes': ['blocked-ip'],
		};
	}

	const params = new URLSearchParams({
		secret: CONFIG.RECAPTCHA.SECRET_KEY,
		response: token,
		remoteip,
	});

	let response: unknown;
	try {
		const res = await fetch(
			'https://www.google.com/recaptcha/api/siteverify',
			{
				method: 'POST',
				body: params,
			},
		);
		response = await res.json();
	} catch (error) {
		// Treat network errors as failures
		recordFailure(remoteip);
		logger.error(`[recaptcha] network error: ${error}`);
		return {
			success: false,
		};
	}

	const parsedResponse = zGoogleCaptchaResponse.safeParse(response);
	if (!parsedResponse.success) {
		await recordFailure(remoteip);
		logger.error(
			`[recaptcha] malformed response ${fromZodError(
				parsedResponse.error,
			).toString()}`,
		);
		return {
			success: false,
			'error-codes': parsedResponse.data?.['error-codes'],
		};
	}

	if (!parsedResponse.data.success) {
		await recordFailure(remoteip);
		logger.warn(
			'[recaptcha] verification failed:',
			parsedResponse.data['error-codes'],
		);
	}

	// Success → reset failure count
	if (parsedResponse.data.success) {
		await resetFailures(remoteip);
	}

	return {
		success: parsedResponse.data.success,
		...(parsedResponse.data.success
			? {
					score: parsedResponse.data.score,
					action: parsedResponse.data.action,
					hostname: parsedResponse.data.hostname,
				}
			: {
					'error-codes': parsedResponse.data?.['error-codes']
						? parsedResponse.data['error-codes']
						: undefined,
				}),
	};
}
