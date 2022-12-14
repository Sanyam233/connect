const duplicateFieldError = (err) => {
    const message = `This email already exists. Please sign in or use another email to register`;
    const newError = new Error(message);
    newError.statusCode = 500;
    newError.isOperational = true;
    return newError;
};

const ValidationError = (err) => {
    const errors = Object.values(err.errors).map((e) => e.message);
    const message = `Invalid inputs. ${errors.join('. ')}`;
    const newError = new Error(message);
    newError.statusCode = 400;
    newError.isOperational = true;
    return newError;
};

const productionErrorResponse = (err, res) => {
    let message = 'Something went wrong!';
    if (err.isOperational) {
        message = err.message;
    }
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

const developmentErrorResponse = (err, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    modifiedError = err;
    if (process.env.NODE_ENV == 'production') {
        console.log('here in prod');
        if (err.code === 11000) modifiedError = duplicateFieldError(err);
        if (err.name === 'ValidationError')
            modifiedError = ValidationError(err);
        return productionErrorResponse(modifiedError, res);
    }
    return developmentErrorResponse(modifiedError, res);
};
