import argon2 from 'argon2';
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
