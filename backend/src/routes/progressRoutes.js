const express = require('express');
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true }); // to access courseId from parent router

// All routes after this middleware require authentication
router.use(protect);

// Routes for chapters and progress
router.get('/chapters/:chapterId', progressController.getChapterContent);
router.post('/chapters/:chapterId/submit', progressController.submitChapterAnswers);
router.get('/progress', progressController.getUserCourseProgress);

module.exports = router;
