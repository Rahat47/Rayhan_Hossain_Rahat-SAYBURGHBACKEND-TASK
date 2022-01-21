import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        required: true,
    },
    slug: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

blogSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'blog',

});

blogSchema.pre('save', function (next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

blogSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'createdBy',
        select: 'firstName lastName email _id',
    });
    next();
});

blogSchema.index({
    // create an index on the slug field
    slug: 'text',
    // create an index on the title field
    title: 'text',
});

// if the blog is updated, the slug field should be updated
blogSchema.pre('findOneAndUpdate', function (next) {
    this.findOneAndUpdate({}, { $set: { slug: slugify(this.getUpdate().title, { lower: true }) } });
    next();
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
