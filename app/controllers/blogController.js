import { asyncHandler } from '../utils/asyncHandler.js';
import Blog from '../models/Blogs.js';
import APIFeatures from '../utils/APIFeatures.js';
import AppError from '../utils/AppError.js';
import Comment from '../models/Comments.js';

export const createBlog = asyncHandler(async (req, res, next) => {
    const { title, content, tags } = req.body;
    const createdBy = req.user._id;

    const blog = await Blog.create({
        title,
        content,
        tags,
        createdBy,
    });

    res.status(201).json({
        success: true,
        data: blog,
    });
});

export const getBlogs = asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(Blog.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const blogs = await features.query;

    res.status(200).json({
        success: true,
        data: blogs,
    });
});

export const getBlog = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;

    if (!slug) {
        return next(new AppError('No slug found', 404));
    }

    const blog = await Blog.findOne({ slug })
        .populate('createdBy', 'firstName lastName email _id')
        .populate('comments', 'content createdBy createdAt');

    if (!blog) {
        return next(new AppError('No blog found', 404));
    }

    res.status(200).json({
        success: true,
        data: blog,
    });
});

export const updateBlog = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;
    const { title, content, tags } = req.body;
    const updatedBy = req.user._id;

    if (!slug) {
        return next(new AppError('No slug found', 404));
    }

    const blog = await Blog.findOne({ slug }).populate('createdBy', 'firstName lastName email _id');
    if (!blog) {
        return next(new AppError('No blog found', 404));
    }

    if (blog.createdBy._id.toString() !== updatedBy.toString()) {
        return next(new AppError('You are not authorized to perform this action', 401));
    }

    const updatedBlog = await Blog.findOneAndUpdate(
        { slug },
        { title, content, tags },
        { new: true },
    );

    res.status(200).json({
        success: true,
        data: updatedBlog,
    });
});

export const deleteBlog = asyncHandler(async (req, res, next) => {
    const { slug } = req.params;
    const deletedBy = req.user._id;

    if (!slug) {
        return next(new AppError('No slug found', 404));
    }

    const blog = await Blog.findOne({ slug }).populate('createdBy', '_id');
    if (!blog) {
        return next(new AppError('No blog found', 404));
    }

    if (blog.createdBy._id.toString() !== deletedBy.toString()) {
        return next(new AppError('You are not authorized to perform this action', 401));
    }

    await Blog.findOneAndDelete({ slug });

    // delete comments associated with blog
    await Comment.deleteMany({ blog: blog._id });

    res.status(204).json({
        success: true,
        data: null,
    });
});
