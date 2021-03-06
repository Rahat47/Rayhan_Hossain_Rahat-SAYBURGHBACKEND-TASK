import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import requestIp from 'request-ip';
import cookieParser from 'cookie-parser';
import { globalErrorMiddleware } from './middlewares/globalErrorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors());
app.use(requestIp.mw());
app.use(cookieParser());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// define routes

app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);

app.all('*', (req, res) => {
    res.status(404).json({
        message: 'Welcome to the beginning of nothingness',
    });
});

app.use(globalErrorMiddleware);

export default app;
