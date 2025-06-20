require("dotenv").config();

module.exports = {
  secret:
    process.env.JWT_SECRET || "fallback_secret_for_development_only_change_me",
  expiresIn: process.env.JWT_EXPIRES_IN || "1h", // Token expiration time
};
