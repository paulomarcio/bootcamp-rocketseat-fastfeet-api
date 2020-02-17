import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

// Importing controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';

// Importing middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Session routes
routes.post('/sessions', SessionController.store);

// Auth Middleware
routes.use(authMiddleware);

// User routes
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

// Recipient routes
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

// Deliveryman routes
routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);
routes.post(
  '/deliveryman/:id/files',
  upload.single('file'),
  DeliverymanController.upload
);

// Delivery routes

export default routes;
