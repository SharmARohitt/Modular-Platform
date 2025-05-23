require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cluster = require('cluster');
const os = require('os');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const userRoutes = require('./routes/userRoutes');
const progressRoutes = require('./routes/progressRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Performance optimization for JSON parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration with pre-flight handling
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Logging - only use in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Add request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000, () => {
    res.status(408).send('Request Timeout');
  });
  next();
});

// Compression middleware to reduce payload size
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      // Don't compress responses with this request header
      return false;
    }
    // Use compression by default
    return compression.filter(req, res);
  }
}));

// Import rate limiters
const { authLimiter, apiLimiter, courseCreationLimiter } = require('./middleware/rateLimiter');

// API Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', apiLimiter, courseRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/courses/:courseId', apiLimiter, progressRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB using MongoDB Memory Server for development
const { connectDB } = require('./config/database');

// Function to start the server
const startServer = () => {
  if (process.env.NODE_ENV === 'production') {
    // Use regular MongoDB connection in production
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('Connected to MongoDB');
        const server = app.listen(PORT, () => {
          console.log(`Server running on port ${PORT} | Worker: ${process.pid}`);
        });
        
        // Graceful shutdown handling
        setupGracefulShutdown(server);
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
      });
  } else {
    // Use MongoDB Memory Server in development
    connectDB()
      .then(() => {
        const server = app.listen(PORT, () => {
          console.log(`Server running on port ${PORT} | Worker: ${process.pid}`);
        });
        
        // Graceful shutdown handling
        setupGracefulShutdown(server);
      })
      .catch(err => {
        console.error('Failed to start MongoDB Memory Server:', err.message);
        console.log('Starting server without MongoDB connection...');
        
        // Start server anyway for development purposes
        const server = app.listen(PORT, () => {
          console.log(`Server running on port ${PORT} (Without MongoDB connection) | Worker: ${process.pid}`);
        });
        
        // Graceful shutdown handling
        setupGracefulShutdown(server);
      });
  }
};

// Setup graceful shutdown
const setupGracefulShutdown = (server) => {
  // Handle termination signals
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed');
        mongoose.connection.close(false, () => {
          console.log('Database connection closed');
          process.exit(0);
        });
      });
      
      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    });
  });
};

// Implement clustering for better performance in production
if (process.env.NODE_ENV === 'production' && cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  
  // Fork workers based on CPU cores (leave 1 core for the OS)
  const numCPUs = Math.max(1, os.cpus().length - 1);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Listen for workers dying and replace them
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`);
    console.log('Starting a new worker');
    cluster.fork();
  });
} else {
  // Start server directly or in worker
  startServer();
}
