import argon2 from 'argon2';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { randomToken } from '../utils/randomToken.js';

const getJwtToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
});

const revokeRefreshToken = async (token, ipAddress) => {
    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken) {
        return;
    }

    refreshToken.revoked = true;
    refreshToken.revokedByIp = ipAddress;

    await refreshToken.save();
};

const createRefreshToken = async (user, ipAddress, cookies) => {
    if (cookies && cookies.refreshToken) {
        // if refresh token is already present in the cookies, revoke it
        await revokeRefreshToken(cookies.refreshToken, ipAddress);
    }

    const refreshToken = RefreshToken({
        user: user._id,
        token: randomToken(),
        expiresAt: new Date(Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60)),
        createdByIp: ipAddress,
    });

    await refreshToken.save();

    return refreshToken;
};

const sendTokenResponse = async (token, data, statusCode, res, req) => {
    const cookieOptions = {
        expires: new Date(
            Date.now() + (Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60),
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    const refreshToken = await createRefreshToken(data, req.clientIp, req.cookies);

    res.cookie('refreshToken', refreshToken.token, cookieOptions);

    res.status(statusCode).json({
        success: true,
        token,
        data,
        refreshToken: refreshToken.token,
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

    sendTokenResponse(token, user, 201, res, req);
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

    sendTokenResponse(token, user, 200, res, req);
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

export const refreshTheToken = asyncHandler(async (req, res, next) => {
    let token;

    if (!req.body.token) token = req.cookies.refreshToken;
    else token = req.body.token;

    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken || refreshToken.revoked || !refreshToken.isActive) {
        return next(new AppError('Invalid refresh token', 401));
    }

    const user = await User.findById(refreshToken.user);

    if (!user) {
        return next(new AppError('Invalid refresh token', 401));
    }

    const newToken = getJwtToken(user);

    sendTokenResponse(newToken, user, 200, res, req);
});

export const revokeToken = asyncHandler(async (req, res, next) => {
    const refreshToken = await RefreshToken.findOne({ token: req.body.token });

    if (!refreshToken) {
        return next(new AppError('Invalid refresh token', 401));
    }

    // there shoule be an authorization step here, so that only admins can revoke tokens
    // but as this app does not have roles or permissions, I am not implementing it for now

    refreshToken.revoked = true;
    refreshToken.revokedByIp = req.clientIp;

    await refreshToken.save();

    res.status(200).json({
        success: true,
        message: 'Refresh token revoked',
    });
});

export const getRefreshTokensForUser = asyncHandler(async (req, res, next) => {
    const refreshTokens = await RefreshToken.find({ user: req.params.id });

    res.status(200).json({
        success: true,
        data: refreshTokens,
    });
});

export const getUsers = asyncHandler(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        data: users,
    });
});
