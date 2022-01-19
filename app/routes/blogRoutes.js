import express from 'express';
import { protectRoute } from '../controllers/authController.js';
import {
    createBlog, deleteBlog, getBlog, getBlogs, updateBlog,
} from '../controllers/blogController.js';

const router = express.Router();

router.route('/')
    .post(protectRoute, createBlog)
    .get(getBlogs);

router.route('/:slug')
    .get(getBlog)
    .patch(protectRoute, updateBlog)
    .delete(protectRoute, deleteBlog);

export default router;
