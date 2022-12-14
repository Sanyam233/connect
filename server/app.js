const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const ErrorHandler = require('./Controllers/Error');
const AuthRouter = require('./Routes/Auth');

dotenv.config({ path: './.env' });

const app = express();

//MIDDLEWARES

//reads request body
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.WHITELISTED_ORIGIN,
        credentials: true,
    })
);

//Error Middleware
app.use('/auth', AuthRouter);
app.use('*', (req, res, next) => {
    const error = new Error(`${req.originalUrl} doesnot exist`);
    error.statusCode = 404;
    next(error);
});
app.use(ErrorHandler);

module.exports = app;
