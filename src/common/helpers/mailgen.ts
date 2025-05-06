import Mailgen from 'mailgen';
import { CONFIG } from '#app/config';

/**
 * Initializes and exports a configured instance of Mailgen used to generate
 * HTML and plaintext email templates.
 *
 * @constant
 * @type {Mailgen}
 * @see {@link https://github.com/eladnava/mailgen Mailgen documentation}
 */
export const mailGenerator = new Mailgen({
	theme: 'default',
	textDirection: 'ltr',
	product: {
		name: `${CONFIG.EMAIL.FROM_NAME} 🧠💡`,
		link: CONFIG.APP.URL,
	},
});
