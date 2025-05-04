import nodemailer from 'nodemailer';
import { CONFIG } from '#app/config';

export const emailTransporter = nodemailer.createTransport({
	host: CONFIG.EMAIL.HOST,
	port: CONFIG.EMAIL.PORT,
	secure: CONFIG.EMAIL.PORT === 465, // true for port 465, false for other ports
	auth: {
		user: CONFIG.EMAIL.USER,
		pass: CONFIG.EMAIL.PASS,
	},
});
