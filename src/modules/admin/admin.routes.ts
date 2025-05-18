import { Router } from 'express';
import { bullmqServerAdapter } from '#app/common/utils/bullmq/bullmq.util';
import { adminController } from './admin.controller';

const adminRouterV1 = Router();

adminRouterV1.get('/', adminController.index);

// BullMQ UI
adminRouterV1.use('/queues', bullmqServerAdapter.getRouter());

export { adminRouterV1 };
