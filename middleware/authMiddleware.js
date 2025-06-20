const jwt = require("jsonwebtoken");
const { secret } = require("../config/jwt");
const { sequelize } = require("../config/db.mysql");
const User = require("../models/mysql/User")(sequelize); // Ensure User model is loaded

const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (e.g., "Bearer TOKEN_STRING")
      token = req.headers.authorization.split(" ")[1];

      // Verify token using the secret
      const decoded = jwt.verify(token, secret);

      // Find user by ID from the decoded token payload
      // Exclude password attribute from the returned user object for security
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      // If user is not found (e.g., deleted from DB after token was issued)
      if (!req.user) {
        res.status(401); // Unauthorized
        throw new Error("Not authorized, user associated with token not found");
      }

      next(); // User is authenticated, proceed to the next middleware/controller
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      res.status(401); // Unauthorized
      // Pass error to centralized error handler
      next(new Error("Not authorized, token is invalid or expired"));
    }
  }

  // If no token is provided in the header
  if (!token) {
    res.status(401); // Unauthorized
    next(new Error("Not authorized, no token provided")); // Pass to error handler
  }
};

module.exports = protect;
