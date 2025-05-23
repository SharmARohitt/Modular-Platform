const express = require('express');
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes after this middleware require authentication
router.use(protect);

// Routes for current user
router.patch('/updateMe', userController.updateMe);
router.get('/enrolledCourses', userController.getEnrolledCourses);
router.post('/enroll/:courseId', userController.enrollInCourse);

// Routes restricted to admin
router.use(restrictTo('admin'));
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);

module.exports = router;
