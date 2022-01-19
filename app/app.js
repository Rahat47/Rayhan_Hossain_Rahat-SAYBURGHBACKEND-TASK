import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { globalErrorMiddleware } from './middlewares/globalErrorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors());

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// define routes

app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

app.all('*', (req, res) => {
    res.status(404).json({
        message: 'Welcome to the beginning of nothingness',
    });
});

app.use(globalErrorMiddleware);

export default app;
