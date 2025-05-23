const Chapter = require('../models/Chapter');
const Question = require('../models/Question');
const UserProgress = require('../models/UserProgress');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Get chapter content with questions
exports.getChapterContent = catchAsync(async (req, res, next) => {
  const chapterId = req.params.chapterId;
  
  const chapter = await Chapter.findById(chapterId)
    .populate('questions');
  
  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }
  
  // Update user's last accessed chapter if they're enrolled
  if (req.user) {
    await UserProgress.findOneAndUpdate(
      { 
        user: req.user.id,
        course: req.params.courseId
      },
      {
        lastAccessedChapter: chapterId,
        lastAccessedAt: Date.now()
      }
    );
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      chapter
    }
  });
});

// Submit answers for chapter questions
exports.submitChapterAnswers = catchAsync(async (req, res, next) => {
  const { answers } = req.body; // { questionId: answer }
  const chapterId = req.params.chapterId;
  const courseId = req.params.courseId;
  const userId = req.user.id;
  
  // Get all questions for this chapter
  const questions = await Question.find({ chapter: chapterId });
  
  // Calculate score
  let score = 0;
  let totalPossible = 0;
  const answersResult = [];
  
  for (const question of questions) {
    totalPossible += question.points;
    
    const userAnswer = answers[question.id];
    let isCorrect = false;
    
    if (userAnswer) {
      // Check if answer is correct based on question type
      if (question.type === 'mcq') {
        // Find selected option
        const selectedOption = question.options.find(option => 
          option._id.toString() === userAnswer || option.text === userAnswer);
        
        isCorrect = selectedOption && selectedOption.isCorrect;
      } else {
        // For text and fill-blank questions
        isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      }
      
      // Add points if correct
      if (isCorrect) {
        score += question.points;
      }
      
      // Add answer result
      answersResult.push({
        question: question._id,
        userAnswer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0
      });
    }
  }
  
  // Update user progress
  const userProgress = await UserProgress.findOne({
    user: userId,
    course: courseId
  });
  
  if (!userProgress) {
    return next(new AppError('You are not enrolled in this course', 400));
  }
  
  // Check if this chapter was already completed
  const chapterIndex = userProgress.completedChapters.findIndex(
    chapter => chapter.chapter.toString() === chapterId
  );
  
  if (chapterIndex >= 0) {
    // Update existing record
    userProgress.completedChapters[chapterIndex].score = score;
    userProgress.completedChapters[chapterIndex].totalPossibleScore = totalPossible;
    userProgress.completedChapters[chapterIndex].completedAt = Date.now();
    userProgress.completedChapters[chapterIndex].answers = answersResult;
  } else {
    // Add new completed chapter
    userProgress.completedChapters.push({
      chapter: chapterId,
      score,
      totalPossibleScore: totalPossible,
      completedAt: Date.now(),
      answers: answersResult
    });
  }
  
  // Calculate overall progress percentage
  // This would ideally get total chapters in course and calculate percentage
  // For simplicity, we're just updating it based on completed chapters
  
  await userProgress.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      score,
      totalPossible,
      percentage: Math.round((score / totalPossible) * 100)
    }
  });
});

// Get user's progress for a specific course
exports.getUserCourseProgress = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const userId = req.user.id;
  
  const progress = await UserProgress.findOne({
    user: userId,
    course: courseId
  }).populate('lastAccessedChapter completedChapters.chapter');
  
  if (!progress) {
    return next(new AppError('No progress found for this course', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      progress
    }
  });
});
