import type { JwtPayload } from 'jsonwebtoken';

/**
 * Interface representing a decoded JWT token.
 *
 * This extends the base `JwtPayload` from `jsonwebtoken` and adds the `userId` property,
 * which is a required field for identifying the user associated with the token.
 *
 * @interface DecodedToken
 * @extends JwtPayload
 *
 * @property {string} userId - The ID of the user associated with the token.
 */
export interface DecodedToken extends JwtPayload {
	userId: string;
	githubId: string;
}
