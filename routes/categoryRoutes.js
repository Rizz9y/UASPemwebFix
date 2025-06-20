const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { cacheResponse } = require("../middleware/cacheMiddleware");
const {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Routes for getting categories (accessible by Admin and Staff, and responses are cached)
router
  .route("/")
  .get(protect, authorize(["admin", "staff"]), cacheResponse, getAllCategories);

router
  .route("/:id")
  .get(protect, authorize(["admin", "staff"]), getCategoryById);

// Routes for adding, updating, and deleting categories (only accessible by Admin)
router.route("/").post(protect, authorize("admin"), addCategory);

router
  .route("/:id")
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

module.exports = router;
