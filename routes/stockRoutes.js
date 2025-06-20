const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { cacheResponse } = require("../middleware/cacheMiddleware"); // Caching for transaction lists
const {
  stockIn,
  stockOut,
  stockAdjustment,
  getAllStockTransactions,
  getStockTransactionsByProduct,
} = require("../controllers/stockController");

// Routes for recording stock movements (accessible by Admin and Staff)
router.post("/in", protect, authorize(["admin", "staff"]), stockIn);
router.post("/out", protect, authorize(["admin", "staff"]), stockOut);
router.post(
  "/adjustment",
  protect,
  authorize(["admin", "staff"]),
  stockAdjustment
);

// Routes for viewing stock transactions (accessible by Admin and Staff, and responses are cached)
router.get(
  "/transactions",
  protect,
  authorize(["admin", "staff"]),
  cacheResponse,
  getAllStockTransactions
);
router.get(
  "/transactions/product/:productId",
  protect,
  authorize(["admin", "staff"]),
  getStockTransactionsByProduct
);

module.exports = router;
