const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); //
const authorize = require("../middleware/roleMiddleware"); //
const {
  exportProductsToExcel,
  exportStockTransactionsToExcel,
} = require("../controllers/exportController");

// Rute untuk mengekspor produk (Admin dan Staff bisa melihat dan mengekspor)
router.get(
  "/products",
  protect,
  authorize(["admin", "staff"]),
  exportProductsToExcel
);

// Rute untuk mengekspor riwayat stok (Admin dan Staff bisa melihat dan mengekspor)
router.get(
  "/stock-transactions",
  protect,
  authorize(["admin", "staff"]),
  exportStockTransactionsToExcel
);

module.exports = router;
