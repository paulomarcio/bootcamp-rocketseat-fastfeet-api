import { Router } from 'express';

// Importing controllers
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

// Importing middlewares
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

// Session routes
routes.post('/sessions', SessionController.store);

// Auth Middleware
routes.use(authMiddleware);

// User routes
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

// Recipients routes
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

export default routes;
