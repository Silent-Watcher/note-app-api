import { Router } from 'express';
import { authController } from './auth.controller';

const authRouterV1 = Router();

authRouterV1.post('/register', authController.registerV1);

export { authRouterV1 };
