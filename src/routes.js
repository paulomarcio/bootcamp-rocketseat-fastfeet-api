import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

// Importing controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import PackageController from './app/controllers/PackageController';

// Importing middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Session routes
routes.post('/sessions', SessionController.store);

// Deliveryman/Delivery routes
routes.get('/deliveryman/:id/deliveries', PackageController.index);
routes.post('/deliveryman/:id/deliveries', PackageController.store);
routes.put(
  '/deliveryman/:id/deliveries',
  upload.single('file'),
  PackageController.update
);

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
routes.get('/deliveries', DeliveryController.index);
routes.post('/deliveries', DeliveryController.store);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

export default routes;
