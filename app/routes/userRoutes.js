import express from 'express';
import {
    signup, login, updatePassword, protectRoute,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/updatePassword', protectRoute, updatePassword);

export default router;
