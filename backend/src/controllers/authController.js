const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Register a new user
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;
  
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  // Create new user - role will be 'learner' by default unless specified
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: role || 'learner'
  });

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // Remove password from output
  const userObj = user.toSafeObject();

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: userObj
    }
  });
});

// Login user
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email });
  
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Update last login timestamp
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  // Generate JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  // Remove password from output
  const userObj = user.toSafeObject();

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: userObj
    }
  });
});

// Get current user
exports.getCurrentUser = catchAsync(async (req, res) => {
  // User is already available in req.user due to protect middleware
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user.toSafeObject()
    }
  });
});
