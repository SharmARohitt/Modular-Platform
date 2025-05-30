const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const User = require('../models/User');

// Protect routes - verify token and check if user exists
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4) Add user to request object
  req.user = user;
  next();
});

// Restrict access to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'learner']
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
