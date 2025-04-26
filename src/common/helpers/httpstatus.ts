/**
 * A frozen object containing standard HTTP status codes mapped to their numeric values.
 *
 * This object serves as a reference for HTTP response status codes, including informational (1xx),
 * success (2xx), redirection (3xx), client error (4xx), and server error (5xx) responses.
 *
 * @readonly
 * @enum {number}
 */
const CODES = Object.freeze({
	CONTINUE: 100,
	SWITCHING_PROTOCOLS: 101,
	PROCESSING: 102,
	EARLY_HINTS: 103,
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NON_AUTHORITATIVE_INFORMATION: 203,
	NO_CONTENT: 204,
	RESET_CONTENT: 205,
	PARTIAL_CONTENT: 206,
	MULTI_STATUS: 207,
	MULTIPLE_CHOICES: 300,
	MOVED_PERMANENTLY: 301,
	MOVED_TEMPORARILY: 302,
	SEE_OTHER: 303,
	NOT_MODIFIED: 304,
	USE_PROXY: 305,
	TEMPORARY_REDIRECT: 307,
	PERMANENT_REDIRECT: 308,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENT_REQUIRED: 402,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	NOT_ACCEPTABLE: 406,
	PROXY_AUTHENTICATION_REQUIRED: 407,
	REQUEST_TIMEOUT: 408,
	CONFLICT: 409,
	GONE: 410,
	LENGTH_REQUIRED: 411,
	PRECONDITION_FAILED: 412,
	REQUEST_TOO_LONG: 413,
	REQUEST_URI_TOO_LONG: 414,
	UNSUPPORTED_MEDIA_TYPE: 415,
	REQUESTED_RANGE_NOT_SATISFIABLE: 416,
	EXPECTATION_FAILED: 417,
	IM_A_TEAPOT: 418,
	INSUFFICIENT_SPACE_ON_RESOURCE: 419,
	METHOD_FAILURE: 420,
	MISDIRECTED_REQUEST: 421,
	UNPROCESSABLE_ENTITY: 422,
	LOCKED: 423,
	FAILED_DEPENDENCY: 424,
	UPGRADE_REQUIRED: 426,
	PRECONDITION_REQUIRED: 428,
	TOO_MANY_REQUESTS: 429,
	REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
	UNAVAILABLE_FOR_LEGAL_REASONS: 451,
	INTERNAL_SERVER_ERROR: 500,
	NOT_IMPLEMENTED: 501,
	BAD_GATEWAY: 502,
	SERVICE_UNAVAILABLE: 503,
	GATEWAY_TIMEOUT: 504,
	HTTP_VERSION_NOT_SUPPORTED: 505,
	INSUFFICIENT_STORAGE: 507,
	NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const);

/**
 * A proxy that allows bidirectional access between HTTP status code names and numbers.
 *
 * You can:
 * - Access status codes by name: `httpStatus.OK` → `200`
 * - Get the status code name by number: `httpStatus[200]` → `"OK"`
 *
 * If the requested property is not a valid status name or number, it returns `undefined`.
 *
 * @typedef {object} httpStatus
 * @property {number} [statusName] - Access the numeric value by using a status name (e.g. `OK`, `NOT_FOUND`).
 * @property {string | undefined} [code] - Access the status name by using a numeric code (e.g. `200`, `404`).
 *
 * @example
 * httpStatus.NOT_FOUND // 404
 * httpStatus[404] // "NOT_FOUND"
 *
 * @constant
 */
export const httpStatus = new Proxy(CODES, {
	get(CODES, property) {
		if (property in CODES) {
			return CODES[property as keyof typeof CODES];
		}

		const code = Number(property);
		if (!Number.isNaN(code)) {
			return Object.keys(CODES).find(
				(value) => CODES[value as keyof typeof CODES] === code,
			);
		}

		return undefined;
	},
});

/**
 * All numeric values in CODES, e.g. 100 | 101 | … | 500
 */
export type HttpStatusCode = (typeof CODES)[keyof typeof CODES];
