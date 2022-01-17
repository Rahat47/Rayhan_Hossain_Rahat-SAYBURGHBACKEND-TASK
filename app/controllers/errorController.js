/* eslint-disable no-console */
import AppError from '../utils/AppError.js';

const handleDuplicateValueDB = (err) => {
    const keys = Object.keys(err.keyValue);

    let message;

    if (keys.length > 1) {
        message = `Duplicate ${keys.join(' and ')} values: ${keys.map((key) => err.keyValue[key]).join(' and ')}`;
    } else {
        message = `Duplicate ${keys[0]} value: ${err.keyValue[keys[0]]}`;
    }

    return new AppError(message, 422);
};

export const sendDevError = (err, res) => {
    console.log(err);

    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

export const sendProdError = (err, res) => {
    let error = err;

    console.log(error);

    if (error.code === 11000) {
        error = handleDuplicateValueDB(error);
    }

    // Operational , Trusted eror that we want to send to client
    if (error.isOperational) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    } else {
        // Programming or other errors that we do not want to send to client
        // console.error('Error: ', err);

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong.',
        });
    }
};
