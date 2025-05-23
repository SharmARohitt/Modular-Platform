const { AppError } = require('../utils/appError');
const { logError, handleOperationalError, handleCriticalError } = require('../utils/errorMonitoring');

// Development error handler with more details
const sendErrorDev = (err, req, res) => {
  // Log error for development debugging
  logError(err, req, 'Development Error');
  
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error handler with less details
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    // Use the enhanced operational error handler
    handleOperationalError(err, req, res);
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Track critical error but don't expose details
    handleCriticalError(err, req);
    
    // Send generic message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Our team has been notified.'
    });
  }
};

// Handle specific error types
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

// Main error handling middleware
exports.errorHandler = (err, req, res, next) => {
  // Set default error code and status
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Add request timestamp for better tracking
  req.errorTimestamp = new Date().toISOString();

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name; // Ensure the error name is copied

    // Handle different types of errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    // Handle MongoDB-specific errors
    if (error.name === 'MongoServerError') {
      // Handle based on error code
      switch(error.code) {
        case 11000:
          error = handleDuplicateFieldsDB(error);
          break;
        default:
          error = new AppError('Database operation failed', 500);
          error.isOperational = false; // Mark as programming error
      }
    }

    sendErrorProd(error, req, res);
  }
};
