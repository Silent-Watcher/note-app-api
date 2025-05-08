process.env.LOG_LEVEL = 'info';
process.env.APP_ENV = 'development';
process.env.APP_PORT = 3000;
process.env.APP_HOST = 'localhost';
process.env.MONGO_HOST = '127.0.0.1';
process.env.MONGO_PORT = 27017;
process.env.MONGO_USERNAME = 'root';
process.env.MONGO_PASSWORD = '1234';
process.env.REDIS_HOST = '127.0.0.1';
process.env.REDIS_PORT = 27017;
process.env.REDIS_USERNAME = 'root';
process.env.REDIS_PASSWORD = '1234';
process.env.NODE_ENV = 'development';
process.env.ACCESS_TOKEN_SECRET =
	'0e3cc311252b72486911325ba8143f4a928ee36e0035b006f422a20e32223214f72e942fe2c4f84696aa26dfe59c2ef5d6a40b97e9562a4872f30bdfe04707f6';
process.env.REFRESH_TOKEN_SECRET =
	'0e3cc311252b72486911325ba8143f4a928ee36e0035b006f422a20e32223214f72e942fe2c4f84696aa26dfe59c2ef5d6a40b97e9562a4872f30bdfe04707f6';
process.env.COOKIE_SECRET =
	'0e3cc311252b72486911325ba8143f4a928ee36e0035b006f422a20e32223214f72e942fe2c4f84696aa26dfe59c2ef5d6a40b97e9562a4872f30bdfe04707f6';

process.env.EMAIL_FROM_ADDRESS = 'support@note.com';
process.env.EMAIL_FROM_NAME = 'AI-Note-App';
process.env.EMAIL_HOST = 'sandbox.smtp.mailtrap.io';
process.env.EMAIL_PASS = '186966e33c6e4e';
process.env.EMAIL_PORT = 2525;
process.env.EMAIL_USER = 'd8de9923b59b65';
process.env.RESET_PASSWORD_ROUTE = '/auth/reset-password';
process.env.LOGIN_PAGE_ROUTE = '/auth/login';
process.env.CLIENT_BASE_URL = 'http://localhost:3000';

process.env.RECAPTCHA_SECRET_KEY = 'dummy';
process.env.RECAPTCHA_SITE_KEY = 'dummy';
process.env.DEV_RECAPTCHA_AUTH = 'dummy';
