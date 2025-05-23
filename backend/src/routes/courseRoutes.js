const express = require('express');
const courseController = require('../controllers/courseController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - for course discovery
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourse);

// Protected routes - require authentication
router.use(protect);

// Routes that require admin or instructor role
router.post('/', restrictTo('admin'), courseController.createCourse);
router.patch('/:id', restrictTo('admin'), courseController.updateCourse);
router.delete('/:id', restrictTo('admin'), courseController.deleteCourse);

module.exports = router;
