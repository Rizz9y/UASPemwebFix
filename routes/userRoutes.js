const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { cacheResponse } = require("../middleware/cacheMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
} = require("../controllers/userController");

// Routes for user management (Only accessible by Admin)
router
  .route("/")
  .get(protect, authorize("admin"), cacheResponse, getAllUsers) // Cached route for user list
  .post(protect, authorize("admin"), createUser); // Create new user

router
  .route("/:id")
  .get(protect, authorize("admin"), getUserById) // Get specific user details
  .put(protect, authorize("admin"), updateUser) // Update user details
  .delete(protect, authorize("admin"), deleteUser); // Delete user

// Specific route for resetting user password
router.put(
  "/:id/reset-password",
  protect,
  authorize("admin"),
  resetUserPassword
);

module.exports = router;
