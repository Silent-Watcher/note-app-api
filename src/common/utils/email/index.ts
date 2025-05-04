import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import { emailTransporter } from './transporter';

/**
 * Extended error type for handling email sending failures.
 *
 * This interface captures additional metadata commonly returned by Nodemailer
 * when an email fails to send.
 */
interface SendMailError extends Error {
	code?: string;
	responseCode?: number;
	response?: string;
	command?: string;
}

/**
 * Type guard to check whether a given error is a `SendMailError`.
 *
 * @param {unknown} err - The value to check.
 * @returns {err is SendMailError} `true` if the error contains Nodemailer-specific properties.
 */
function isSendMailError(err: unknown): err is SendMailError {
	return (
		err instanceof Error &&
		('code' in err || 'responseCode' in err || 'response' in err)
	);
}

/**
 * Sends an email using the specified Nodemailer transporter.
 *
 * This function wraps `transporter.sendMail()` and handles errors by converting them
 * into consistent HTTP errors using a custom error utility.
 *
 * @param {Mail.Options} emailSendOptions - Mail options including `to`, `from`, `subject`, `html`, etc.
 * @param {Transporter} [transporter=emailTransporter] - A Nodemailer transporter instance.
 *   Defaults to a preconfigured `emailTransporter`.
 *
 * @returns {Promise<string>} The `messageId` of the sent email if successful.
 *
 * @throws {HttpError} Throws an HTTP 500 error if sending the email fails, with
 * additional diagnostic details when available.
 *
 */
export async function sendMail(
	emailSendOptions: Mail.Options,
	transporter: Transporter = emailTransporter,
): Promise<string> {
	try {
		const info = await transporter.sendMail(emailSendOptions);
		return info.messageId;
	} catch (error) {
		if (isSendMailError(error)) {
			throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
				code: error.code,
				message: error.message,
				details: {
					...error,
				},
			});
		}
		throw createHttpError(httpStatus.INTERNAL_SERVER_ERROR, {
			code: 'INTERNAL_SERVER_ERROR',
			message: 'error occured when sending email...',
		});
	}
}
