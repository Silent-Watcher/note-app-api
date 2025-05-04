import Mailgen from 'mailgen';
import { CONFIG } from '#app/config';

export const mailGenerator = new Mailgen({
	theme: 'default',
	textDirection: 'ltr',
	product: {
		name: `${CONFIG.EMAIL.FROM_NAME} 🧠💡`,
		link: CONFIG.APP.URL,
	},
});
