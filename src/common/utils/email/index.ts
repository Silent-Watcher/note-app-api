import type { Transporter } from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';
import { httpStatus } from '#app/common/helpers/httpstatus';
import { createHttpError } from '#app/common/utils/http.util';
import { emailTransporter } from './transporter';

interface SendMailError extends Error {
	code?: string;
	responseCode?: number;
	response?: string;
	command?: string;
}

function isSendMailError(err: unknown): err is SendMailError {
	return (
		err instanceof Error &&
		('code' in err || 'responseCode' in err || 'response' in err)
	);
}

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
