const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const User = require('../Models/User');
const catchAsync = require('../Utils/catchAsync');

const createAcessToken = (id) => {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: `15m`,
    });
};

const createRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: `7d`,
    });
};

exports.register = catchAsync(async (req, res) => {
    const data = req.body;
    await User.create(data);
    return res.sendStatus(201);
});

exports.login = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        const error = new Error('Invalid email or password');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error(
            'No user exists with this email. Try creating a new account'
        );
        error.statusCode = 401;
        throw error;
    }

    const isAMatch = user.comparePasswords(password);

    if (!isAMatch) {
        const error = new Error('Invalid password. Please try again');
        error.statusCode = 401;
        throw error;
    }

    console.log('here');
    const accessToken = createAcessToken(user._id);
    const refreshToken = createRefreshToken(user._id);
    const refreshTokenExpiry = 1000 * 60 * 60 * 24 * 7;

    res.cookie('jwt', refreshToken, {
        maxAge: refreshTokenExpiry,
    });

    res.cookie('isLoggedIn', true, {
        maxAge: refreshTokenExpiry,
        httpOnly: true,
        secure: true,
    });

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
        status: 'success',
        user: {
            username: user.username,
            email: user.email,
            id: user._id,
        },
        accessToken,
    });
};

exports.refreshAccessToken = catchAsync(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        const error = new Error('Not found');
        error.statusCode = 401;
        throw error;
    }

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken });

    if (!foundUser) {
        const error = new Error('forbidden');
        error.statusCode = 403;
        throw error;
    }

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if (err || decoded.id !== foundUser._id.toString()) {
                const error = new Error('forbidden');
                error.statusCode = 403;
                throw error;
            }

            const accessToken = createAcessToken(foundUser._id);
            return res.status(200).json({
                status: 'success',
                accessToken,
            });
        }
    );
});

exports.loginStatus = catchAsync(async (req, res) => {
    const cookies = req.cookies;
    console.log(cookies);
    if (cookies?.isLoggedIn === 'true') {
        return res.sendStatus(302);
    }
    return res.sendStatus(204);
});

exports.logout = catchAsync(async (req, res) => {
    const userID = req.userID;

    const foundUser = await User.findById(userID);

    if (!foundUser) {
        const error = new Error('forbidden');
        error.statusCode = 403;
        throw error;
    }

    res.clearCookie('jwt');

    foundUser.refreshToken = undefined;
    foundUser.refreshTokenExpiry = undefined;

    return res.sendStatus(204);
});
