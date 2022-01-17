/* eslint-disable no-console */
import mongoose from 'mongoose';
import PrettyError from 'pretty-error';
import app from './app/app.js';

const pe = new PrettyError();
// pe.start();

process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const dbUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.egyjd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const startDb = async () => {
    try {
        await mongoose.connect(dbUri);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.log('Error connecting to MongoDB', err);
        process.exit(1);
    }
};

await startDb();

app.listen(process.env.PORT, () => {
    console.log(`Server is listening on port ${process.env.PORT}`);
});
