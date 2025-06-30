import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { levelNames, logger } from '#app/common/utils/logger.util';

const logLevels = levelNames as [string, ...string[]];

const zEnv = z.object({
	NODE_ENV: z.enum(['development', 'test', 'production']),

	APP_ENV: z.enum(['development', 'test', 'production']),
	APP_PORT: z.coerce
		.number()
		.int({ message: 'APP_PORT must be an integer' })
		.min(1, { message: 'APP_PORT must be ≥ 1' })
		.max(65535, { message: 'APP_PORT must be ≤ 65535' }),

	APP_HOST: z.string().nonempty('APP_HOST must be set'),

	MONGO_USERNAME: z
		.string()
		.nonempty({ message: 'MONGO_USERNAME is required' }),
	MONGO_PASSWORD: z
		.string()
		.nonempty({ message: 'MONGO_USERNAME is required' }),
	MONGO_HOST: z.string().nonempty({ message: 'MONGO_HOST is required' }),
	MONGO_PORT: z.coerce
		.number()
		.int({ message: 'MONGO_PORT must be an integer' })
		.min(1, { message: 'MONGO_PORT must be ≥ 1' })
		.max(65535, { message: 'MONGO_PORT must be ≤ 65535' }),

	MONGO_DATABASE: z
		.string()
		.nonempty({ message: 'MONGO_DATABASE is required' })
		.default('test'),

	MONGO_REPLICASET: z
		.string()
		.nonempty({ message: 'MONGO_REPLICASET is required' })
		.default('rs0'),

	REDIS_USERNAME: z
		.string()
		.nonempty({ message: 'REDIS_USERNAME is required' }),
	REDIS_PASSWORD: z
		.string()
		.nonempty({ message: 'REDIS_PASSWORD is required' }),
	REDIS_HOST: z.string().nonempty({ message: 'REDIS_HOST is required' }),
	REDIS_PORT: z.coerce
		.number()
		.int({ message: 'REDIS_PORT must be an integer' })
		.min(1, { message: 'REDIS_PORT must be ≥ 1' })
		.max(65535, { message: 'REDIS_PORT must be ≤ 65535' }),

	LOG_LEVEL: z.enum(logLevels, {
		required_error: 'LOG_LEVEL is required',
		invalid_type_error: `LOG_LEVEL must be one of ${logLevels.join('/')}`,
	}),

	REFRESH_TOKEN_SECRET: z
		.string()
		.regex(
			/^[0-9a-f]{128}$/,
			'REFRESH_TOKEN_SECRET must be a 128-character hexadecimal string',
		),
	ACCESS_TOKEN_SECRET: z
		.string()
		.regex(
			/^[0-9a-f]{128}$/,
			'ACCESS_TOKEN_SECRET must be a 128-character hexadecimal string',
		),

	COOKIE_SECRET: z
		.string()
		.regex(
			/^[0-9a-f]{128}$/,
			'COOKIE_SECRET must be a 128-character hexadecimal string',
		),

	EMAIL_HOST: z
		.string()
		.url()
		.or(z.string().nonempty('EMAIL_HOST is required')), // Mailtrap's domain is not a valid URL, so fallback to non-empty string
	EMAIL_PORT: z
		.string()
		.regex(/^\d+$/, { message: 'EMAIL_PORT must be a number' })
		.transform(Number)
		.refine((port) => port > 0 && port < 65536, {
			message: 'EMAIL_PORT must be a valid port number',
		}),
	EMAIL_USER: z.string().nonempty('EMAIL_USER is required'),
	EMAIL_PASS: z.string().nonempty('EMAIL_PASS is required'),
	EMAIL_FROM_NAME: z.string().nonempty('EMAIL_FROM_NAME is required'),
	EMAIL_FROM_ADDRESS: z
		.string()
		.email({ message: 'EMAIL_FROM_ADDRESS must be a valid email address' }),

	CLIENT_BASE_URL: z
		.string()
		.url({ message: 'CLIENT_BASE_URL must be a valid URL' }),

	RESET_PASSWORD_ROUTE: z
		.string()
		.startsWith('/', {
			message: 'RESET_PASSWORD_ROUTE must start with "/"',
		})
		.min(2, { message: 'RESET_PASSWORD_ROUTE is too short' }),

	LOGIN_PAGE_ROUTE: z
		.string()
		.startsWith('/', {
			message: 'LOGIN_PAGE_ROUTE must start with "/"',
		})
		.min(2, { message: 'LOGIN_PAGE_ROUTE is too short' }),

	RECAPTCHA_SITE_KEY: z.string().nonempty('RECAPTCHA_SITE_KEY is required'),
	RECAPTCHA_SECRET_KEY: z
		.string()
		.nonempty('RECAPTCHA_SECRET_KEY is required'),

	DEV_RECAPTCHA_AUTH: z.string().nonempty('DEV_RECAPTCHA_AUTH is required'),

	MINIO_ACCESS_KEY: z.string().nonempty('MINIO_ACCESS_KEY is required'),
	MINIO_SECRET_KEY: z.string().nonempty('MINIO_SECRET_KEY is required'),
	MINIO_ENDPOINT: z.string().nonempty('MINIO_ENDPOINT is required'),
	MINIO_PORT: z
		.string()
		.regex(/^\d+$/, { message: 'MINIO_PORT must be a number' })
		.transform(Number)
		.refine((port) => port > 0 && port < 65536, {
			message: 'MINIO_PORT must be a valid port number',
		}),
	MINIO_USE_SSL: z.coerce.boolean().default(false),

	CLAMV_HOST: z.string().nonempty({ message: 'CLAMV_HOST is required' }),
	CLAMV_PORT: z
		.string()
		.regex(/^\d+$/, { message: 'CLAMV_PORT must be a number' })
		.transform(Number)
		.refine((port) => port > 0 && port < 65536, {
			message: 'CLAMV_PORT must be a valid port number',
		}),

	GITHUB_CLIENT_ID: z.string().nonempty({
		message: 'GITHUB_CLIENT_ID is required',
	}),
	GITHUB_CLIENT_SECRET: z.string().nonempty({
		message: 'GITHUB_CLIENT_ID is required',
	}),
	GITHUB_CALLBACK_URL: z.string().url().nonempty({
		message: 'GITHUB_CALLBACK_URL is required',
	}),
	GITHUB_STATE_SECRET: z.string().nonempty('GITHUB_STATE_SECRET is required'),

	JWT_ACCESS_SECRET: z.string().nonempty({
		message: 'JWT_ACCESS_SECRET is required',
	}),

	SIGHTENGINE_API_USER: z.string().nonempty({
		message: 'SIGHTENGINE_API_USER is required',
	}),
	SIGHTENGINE_API_SECRET: z.string().nonempty({
		message: 'SIGHTENGINE_API_SECRET is required',
	}),
});

export type Env = z.infer<typeof zEnv>;

const zEnvValidationResult = zEnv.safeParse(process.env);

if (!zEnvValidationResult.success) {
	logger.error(
		`there is an error with env variables!: ${
			fromZodError(zEnvValidationResult.error).message
		}`,
	);
	process.exit(1);
}

export const _env = zEnvValidationResult.data;

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {}
	}
}
