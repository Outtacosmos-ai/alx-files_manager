// routes/index.js
import { Router } from 'express';
import UsersController from '../controllers/UsersController';

const router = Router();

router.post('/users', UsersController.postNew);

export default router;
