export interface IAuthRepository {
	findOtpById(): void;
}

const createAuthRepository = () => ({
	findOtpById() {
		console.log('finding otp from repo ...');
	},
});

export const authRepository = createAuthRepository();
