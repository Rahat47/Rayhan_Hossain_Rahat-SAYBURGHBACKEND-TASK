import express from 'express';
import { protectRoute } from '../controllers/authController.js';
import {
    createBlog, deleteBlog, getBlog, getBlogs, updateBlog,
} from '../controllers/blogController.js';
import commentRouter from './commentRoutes.js';

const router = express.Router();

router.use('/:slug/comments', commentRouter);

router.route('/')
    .post(protectRoute, createBlog)
    .get(getBlogs);

router.route('/:slug')
    .get(getBlog)
    .patch(protectRoute, updateBlog)
    .delete(protectRoute, deleteBlog);

export default router;
