import nodemailer from 'nodemailer';
import { CONFIG } from '#app/config';

/**
 * A preconfigured Nodemailer transporter for sending emails.
 *
 * This transporter is created using SMTP settings from the app's configuration,
 * and supports secure and non-secure connections based on the configured port.
 *
 * - Uses `secure: true` for port 465 (SMTPS)
 * - Uses `secure: false` for ports like 587 (STARTTLS) or 25 (non-encrypted)
 *
 * @constant
 * @type {import('nodemailer').Transporter}
 */
export const emailTransporter = nodemailer.createTransport({
	host: CONFIG.EMAIL.HOST,
	port: CONFIG.EMAIL.PORT,
	secure: CONFIG.EMAIL.PORT === 465,
	auth: {
		user: CONFIG.EMAIL.USER,
		pass: CONFIG.EMAIL.PASS,
	},
});
