const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Get all users - admin only
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().select('-password');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

// Get user by ID
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

// Update current user
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password) {
    return next(new AppError('This route is not for password updates. Please use /updatePassword.', 400));
  }
  
  // 2) Filter unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'avatar');
  
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  }).select('-password');
  
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

// Enroll in a course
exports.enrollInCourse = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const userId = req.user.id;
  
  // Check if user is already enrolled
  const user = await User.findById(userId);
  
  if (user.enrolledCourses.includes(courseId)) {
    return next(new AppError('You are already enrolled in this course', 400));
  }
  
  // Add course to user's enrolled courses
  user.enrolledCourses.push(courseId);
  await user.save({ validateBeforeSave: false });
  
  // Create initial user progress
  await UserProgress.create({
    user: userId,
    course: courseId,
    completionPercentage: 0
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Successfully enrolled in course'
  });
});

// Get enrolled courses for current user
exports.getEnrolledCourses = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const user = await User.findById(userId)
    .populate({
      path: 'enrolledCourses',
      select: 'title description thumbnail level tags duration'
    });
  
  res.status(200).json({
    status: 'success',
    results: user.enrolledCourses.length,
    data: {
      courses: user.enrolledCourses
    }
  });
});

// Helper function
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
