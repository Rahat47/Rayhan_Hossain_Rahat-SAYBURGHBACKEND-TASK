import express from 'express';
import { protectRoute } from '../controllers/authController.js';
import {
    createComment, deleteComment, getComment, getComments, setBlogAndUserID, updateComment,
} from '../controllers/commentController.js';

const router = express.Router({
    mergeParams: true,
});

router.use(protectRoute);

router.route('/')
    .post(setBlogAndUserID, createComment)
    .get(getComments);

router.route('/:id')
    .get(getComment)
    .patch(updateComment)
    .delete(deleteComment);

export default router;
