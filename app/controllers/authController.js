import argon2 from 'argon2';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';

const getJwtToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
});

const sendTokenResponse = (token, data, statusCode, res) => {
    const cookieOptions = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        success: true,
        token,
        data,
    });
};

export const signup = asyncHandler(async (req, res, next) => {
    const {
        firstName, lastName, email, password,
    } = req.body;

    const hashedPassword = await argon2.hash(password);

    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });

    user.password = undefined;

    const token = getJwtToken(user._id);

    sendTokenResponse(token, user, 201, res);
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new AppError('Invalid credentials', 401));
    }

    const isMatch = await user.verifyPassword(password);

    if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
    }

    user.password = undefined;

    const token = getJwtToken(user);

    sendTokenResponse(token, user, 200, res);
});

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { password, newPassword } = req.body;
    // find user by id, as this is a protected route the user is already authenticated and userObject is available in req.user

    const user = await User.findById(req.user.id).select('+password');

    // check if the password is correct
    const isMatch = await user.verifyPassword(password);
    // if not return error
    if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
    }
    // if so update the password with the new password
    user.password = await argon2.hash(newPassword);

    await user.save();

    user.password = undefined;
    // create a new token
    const token = getJwtToken(user);
    // send the new token
    sendTokenResponse(token, user, 200, res);
});

export const protectRoute = asyncHandler(async (req, res, next) => {
    let token;
    // get the token from the headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        [, token] = req.headers.authorization.split(' ');
    }
    // if no token found, return with error
    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    // verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // find the user based on the decoded token
    const currentUser = await User.findById(decoded.id);
    // if no user, return with error
    if (!currentUser) {
        return next(new AppError('There is no user belonging to this token', 401));
    }
    // grant access to protected route
    req.user = currentUser;
    next();
});
