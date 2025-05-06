import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '#app/common/utils/logger.util';
import { CONFIG } from '#app/config';

const zRecaptchaErrorCodes = z.enum([
	'missing-input-secret',
	'invalid-input-secret',
	'missing-input-response',
	'invalid-input-response',
	'bad-request',
	'timeout-or-duplicate',
]);

const zGoogleCaptchaResponse = z.object({
	success: z.boolean(),
	action: z.string().optional(),
	score: z.number().optional(),
	hostname: z.string().optional(),
	'error-codes': z.array(zRecaptchaErrorCodes).optional(),
});

type GoogleCaptchaResponse = z.infer<typeof zGoogleCaptchaResponse>;

export async function verifyWithGoolge(
	token: string,
	remoteip: string,
): Promise<GoogleCaptchaResponse> {
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
		logger.error(`[recaptcha] network error: ${error}`);
		return {
			success: false,
		};
	}

	const parsedResponse = zGoogleCaptchaResponse.safeParse(response);
	if (!parsedResponse.success) {
		logger.error(
			`[recaptcha] invalid response format: ${fromZodError(
				parsedResponse.error,
			).toString()}`,
		);
		return {
			success: false,
			'error-codes': parsedResponse.data?.['error-codes'],
		};
	}

	if (!parsedResponse.data.success) {
		logger.warn(
			'[recaptcha] verification failed:',
			parsedResponse.data['error-codes'],
		);
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
