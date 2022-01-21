import express from 'express';
import {
    signup, login, updatePassword, protectRoute, refreshTheToken, revokeToken, getRefreshTokensForUser, getUsers,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);
router.post('/refresh-token', refreshTheToken);
router.post('/revoke-token', revokeToken);

router.post('/updatePassword', protectRoute, updatePassword);
router.get('/:id/refresh-tokens', getRefreshTokensForUser);
router.get('/', getUsers);

export default router;
