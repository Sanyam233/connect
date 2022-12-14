const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsync = require('../Utils/catchAsync');

const verifyJWT = catchAsync(async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        const error = new Error('Access Denied');
        error.statusCode = 401;
        throw error;
    }

    console.log(authHeader);
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            const error = new Error('Forbidden');
            error.statusCode = 403;
            throw error;
        }

        req.userID = decoded.id;
        next();
    });
});

module.exports = verifyJWT;
