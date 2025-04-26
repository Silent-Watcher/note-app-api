import { Router } from 'express';
import { authRouterV1 } from '#app/modules/auth/auth.routes';

const router = Router();

router.use('/auth', authRouterV1);

router.get('/', (req, res, next) => {
	res.send({
		message: 'hello world',
		version: '1',
	});
});

export default router;
