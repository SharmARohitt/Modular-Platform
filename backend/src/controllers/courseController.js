const Course = require('../models/Course');
const Section = require('../models/Section');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Get all courses (with optional filters)
exports.getAllCourses = catchAsync(async (req, res) => {
  const filter = {};
  
  // Filter by published status
  if (req.query.published) {
    filter.isPublished = req.query.published === 'true';
  }
  
  // Filter by level
  if (req.query.level) {
    filter.level = req.query.level;
  }
  
  // Filter by tags
  if (req.query.tags) {
    filter.tags = { $in: req.query.tags.split(',') };
  }

  const courses = await Course.find(filter)
    .populate('creator', 'firstName lastName')
    .select('title description thumbnail level tags duration enrollmentCount createdAt');

  res.status(200).json({
    status: 'success',
    results: courses.length,
    data: {
      courses
    }
  });
});

// Get a single course with all nested data
exports.getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'sections',
      populate: {
        path: 'units',
        populate: {
          path: 'chapters',
          select: '-questions' // Exclude questions for security
        }
      }
    })
    .populate('creator', 'firstName lastName');

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      course
    }
  });
});

// Create a new course
exports.createCourse = catchAsync(async (req, res) => {
  // Add the current user as the creator
  req.body.creator = req.user.id;

  const newCourse = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      course: newCourse
    }
  });
});

// Update a course
exports.updateCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if user is the creator or an admin
  if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to update this course', 403));
  }

  const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      course: updatedCourse
    }
  });
});

// Delete a course
exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('No course found with that ID', 404));
  }

  // Check if user is the creator or an admin
  if (course.creator.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this course', 403));
  }

  await Course.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
