const errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging
  console.error(err.stack);

  // Determine status code. If status code was already set by a previous middleware/controller, use it.
  // Otherwise, default to 500 (Internal Server Error).
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Send error response in JSON format
  res.json({
    message: err.message,
    // Only include stack trace in development environment for security reasons
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
