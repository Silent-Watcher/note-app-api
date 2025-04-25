import { Router } from 'express';

const router = Router();

router.get('/', (req, res, next) => {
	res.send({
		message: 'hello world',
		version: '1',
	});
});

export default router;
