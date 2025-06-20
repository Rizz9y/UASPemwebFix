const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { cacheResponse } = require("../middleware/cacheMiddleware");
const {
  getAllSuppliers,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

// Routes for getting suppliers (accessible by Admin and Staff, and responses are cached)
router
  .route("/")
  .get(protect, authorize(["admin", "staff"]), cacheResponse, getAllSuppliers);

router
  .route("/:id")
  .get(protect, authorize(["admin", "staff"]), getSupplierById);

// Routes for adding, updating, and deleting suppliers (only accessible by Admin)
router.route("/").post(protect, authorize("admin"), addSupplier);

router
  .route("/:id")
  .put(protect, authorize("admin"), updateSupplier)
  .delete(protect, authorize("admin"), deleteSupplier);

module.exports = router;
