import { sendProdError, sendDevError } from '../controllers/errorController.js';

export const globalErrorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, res);
    } else {
        sendProdError(err, res);
    }
};
