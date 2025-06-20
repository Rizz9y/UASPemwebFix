const authorize = (roles = []) => {
  // Ensure roles is always an array, even if a single string is passed
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // Check if user object and role are available from previous authMiddleware
    if (!req.user || !req.user.role) {
      res.status(403); // Forbidden
      return next(new Error("Access denied: User role information missing."));
    }

    // Check if the user's role is included in the array of allowed roles
    if (!roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      return next(
        new Error(
          `Access denied: User role (${req.user.role}) is not authorized for this action.`
        )
      );
    }

    next(); // User is authorized, proceed to the next middleware/controller
  };
};

module.exports = authorize;
