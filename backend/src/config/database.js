// Database initialization with MongoDB Memory Server
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Function to connect to MongoDB with optimized connection settings
async function connectDB() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Optimize MongoDB connection settings
    const connectionOptions = {
      // Connection pool size
      maxPoolSize: 50,
      minPoolSize: 10,
      
      // Socket timeouts
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // Connection handling
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
      
      // Read preferences
      readPreference: 'primaryPreferred',
      
      // Write concerns
      // w: 'majority', // Uncomment when using replica sets
      retryWrites: true,
      
      // Use the new URL parser
      useNewUrlParser: true
    };
    
    console.log('Connecting to in-memory MongoDB instance with optimized settings...');
    await mongoose.connect(mongoUri, connectionOptions);
    console.log('Connected to in-memory MongoDB');
    
    // Create some seed data if needed
    await createSeedData();
    
    return mongoUri;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Create seed data for development
async function createSeedData() {
  // Import models
  const User = require('../models/User');
  const Course = require('../models/Course');
  const Section = require('../models/Section');
  const Unit = require('../models/Unit');
  const Chapter = require('../models/Chapter');
  const Question = require('../models/Question');
  
  try {
    // Check if we already have users
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('Creating seed data...');
      
      // Create admin user
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@modularlearn.com',
        password: 'password123', // This will be hashed by the model's pre-save hook
        role: 'admin'
      });
      
      // Create learner user
      const learnerUser = await User.create({
        firstName: 'Sample',
        lastName: 'Learner',
        email: 'learner@modularlearn.com',
        password: 'password123', // This will be hashed by the model's pre-save hook
        role: 'learner'
      });
      
      // Create a sample course
      const course = await Course.create({
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming, from basic syntax to advanced concepts like closures, promises, and async/await. This comprehensive course is designed for beginners with no prior programming experience.',
        level: 'beginner',
        tags: ['javascript', 'web development', 'programming'],
        duration: 240, // minutes
        creator: adminUser._id,
        isPublished: true
      });
      
      // Create sections for the course
      const section1 = await Section.create({
        title: 'JavaScript Basics',
        description: 'Learn the fundamental concepts of JavaScript',
        course: course._id,
        order: 1
      });
      
      // Create units for the section
      const unit1 = await Unit.create({
        title: 'Variables and Data Types',
        description: 'Understanding variables, constants, and data types in JavaScript',
        section: section1._id,
        order: 1
      });
      
      // Create chapters for the unit
      const chapter1 = await Chapter.create({
        title: 'Introduction to Variables',
        content: '# Introduction to Variables\n\nVariables are containers for storing data values. In JavaScript, you can declare variables using `var`, `let`, or `const`.\n\n```javascript\nlet message = "Hello, World!";\nconst PI = 3.14159;\n```\n\nLet\'s understand the differences between these variable declarations.',
        unit: unit1._id,
        order: 1,
        duration: 10
      });
      
      const chapter2 = await Chapter.create({
        title: 'JavaScript Data Types',
        content: '# JavaScript Data Types\n\nJavaScript has several built-in data types:\n\n1. **String**: For text\n2. **Number**: For numeric values\n3. **Boolean**: true or false\n4. **Object**: Collections of properties\n5. **Array**: Ordered collections\n6. **Null**: Represents intentional absence of value\n7. **Undefined**: Variable declared but not assigned\n\nLet\'s explore each one with examples.',
        unit: unit1._id,
        order: 2,
        duration: 15
      });
      
      // Create questions for the chapters
      const question1 = await Question.create({
        chapter: chapter1._id,
        type: 'mcq',
        text: 'Which keyword is used to declare a constant variable in JavaScript?',
        options: [
          { text: 'var', isCorrect: false },
          { text: 'let', isCorrect: false },
          { text: 'const', isCorrect: true },
          { text: 'constant', isCorrect: false }
        ],
        points: 10
      });
      
      const question2 = await Question.create({
        chapter: chapter2._id,
        type: 'text',
        text: 'Name the data type used to represent decimal numbers in JavaScript:',
        correctAnswer: 'number',
        points: 10
      });
      
      // Update relationships
      course.sections.push(section1._id);
      await course.save();
      
      section1.units.push(unit1._id);
      await section1.save();
      
      unit1.chapters.push(chapter1._id, chapter2._id);
      await unit1.save();
      
      chapter1.questions.push(question1._id);
      await chapter1.save();
      
      chapter2.questions.push(question2._id);
      await chapter2.save();
      
      console.log('Seed data created successfully!');
    } else {
      console.log('Seed data already exists.');
    }
  } catch (error) {
    console.error('Error creating seed data:', error);
  }
}

// Export connect function
module.exports = { connectDB, mongoServer };
