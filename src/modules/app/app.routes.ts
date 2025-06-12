import { Router } from 'express';
import { verifyUser } from '#app/common/middlewares/verifyUser';
import { authRouterV1 } from '../auth/auth.routes';
import { notesRouterV1 } from '../notes/notes.routes';
import { queuesRouterV1 } from '../queues/queues.routes';
import { tagsRouterV1 } from '../tags/tags.routes';
import { userRouterV1 } from '../users/user.routes';
import { appController } from './app.controller';

const appRouterV1 = Router();

appRouterV1.get('/health', appController.checkHealth);

appRouterV1.get('/', appController.renderIndexPageV1);

appRouterV1.use('/auth', authRouterV1);

appRouterV1.use('/tags', verifyUser, tagsRouterV1);

appRouterV1.use('/notes', verifyUser, notesRouterV1);

appRouterV1.use('/users', verifyUser, userRouterV1);

appRouterV1.use('/queues', queuesRouterV1);

export { appRouterV1 };
