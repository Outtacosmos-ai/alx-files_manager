import { Router } from 'express';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = Router();

// User routes
router.post('/users', UsersController.postNew);
router.get('/users/me', UsersController.getMe);

// Auth routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// Files routes
router.post('/files', FilesController.postUpload);

export default router;
