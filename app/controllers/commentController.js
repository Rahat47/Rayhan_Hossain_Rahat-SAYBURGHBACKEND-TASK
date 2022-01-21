import Blog from '../models/Blogs.js';
import Comment from '../models/Comments.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const setBlogAndUserID = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;
    const { user } = req;

    if (!slug) {
        return next(new AppError('No slug found', 404));
    }

    const blog = await Blog.findOne({ slug });
    if (!blog) {
        return next(new AppError('No blog found', 404));
    }

    req.body.blog = blog._id;
    req.body.user = user._id;
    next();
});

export const createComment = asyncHandler(async (req, res, next) => {
    const { blog, user, content } = req.body;

    const comment = await Comment.create({
        blog,
        createdBy: user,
        content,
    });

    res.status(201).json({
        success: true,
        data: comment,
    });
});

export const getComments = asyncHandler(async (req, res, next) => {
    const comments = await Comment.find({});

    res.status(200).json({
        success: true,
        data: comments,
    });
});

export const getComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const comment = await Comment.findById(id)
        .populate('createdBy', 'firstName lastName email _id')
        .populate('blog', 'title slug');

    if (!comment) {
        return next(new AppError('No comment found', 404));
    }

    res.status(200).json({
        success: true,
        data: comment,
    });
});

export const updateComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { content } = req.body;
    const updatedBy = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
        return next(new AppError('No comment found', 404));
    }

    if (comment.createdBy.toString() !== updatedBy.toString()) {
        return next(new AppError('You are not authorized to update this comment', 401));
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        id,
        { $set: { content } },
        { new: true },
    );

    res.status(200).json({
        success: true,
        data: updatedComment,
    });
});

export const deleteComment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const deletedBy = req.user._id;

    const comment = await Comment.findById(id);

    if (!comment) {
        return next(new AppError('No comment found', 404));
    }

    if (comment.createdBy.toString() !== deletedBy.toString()) {
        return next(new AppError('You are not authorized to delete this comment', 401));
    }

    await Comment.findByIdAndDelete(id);

    res.status(204).json({
        success: true,
        data: null,
    });
});
