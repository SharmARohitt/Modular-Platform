// Enhanced error monitoring and reporting

/**
 * Logs errors with detailed information
 * @param {Error} error - Error object
 * @param {Object} request - Express request object (optional)
 * @param {string} context - Additional context information
 */
const logError = (error, request = null, context = '') => {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    name: error.name,
    message: error.message,
    stack: error.stack,
    context
  };
  
  // Add request information if available
  if (request) {
    errorDetails.request = {
      method: request.method,
      url: request.originalUrl,
      ip: request.ip,
      userId: request.user ? request.user.id : 'unauthenticated'
    };
  }
  
  // In production, this would send to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service
    // Example: sendToMonitoring(errorDetails);
  }
  
  // Always log to console
  console.error('ERROR DETAILS:', JSON.stringify(errorDetails, null, 2));
  
  return errorDetails;
};

/**
 * Handles operational errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleOperationalError = (err, req, res) => {
  logError(err, req, 'Operational Error');
  
  // Send error response
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong'
  });
};

/**
 * Handles critical/programming errors
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 */
const handleCriticalError = (err, req) => {
  logError(err, req, 'Critical Error');
  
  // In production, this could trigger alerts
  if (process.env.NODE_ENV === 'production') {
    // Example: sendAlert(err);
  }
  
  // Important: Don't crash the application unless absolutely necessary
  // For severe errors you might want to exit or restart:
  // process.exit(1);
};

module.exports = {
  logError,
  handleOperationalError,
  handleCriticalError
};
