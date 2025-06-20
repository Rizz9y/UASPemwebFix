const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { cacheResponse } = require("../middleware/cacheMiddleware");
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const multer = require("multer");
const path = require("path");

// Konfigurasi Multer untuk penyimpanan
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder 'uploads' ada di root backend
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Nama file unik: fieldname-timestamp.ext
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// Filter file (memastikan hanya gambar yang diizinkan)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar (JPEG, PNG, GIF) yang diizinkan!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Batas ukuran file 5MB
});

// Routes for getting products
router
  .route("/")
  .get(protect, authorize(["admin", "staff"]), cacheResponse, getAllProducts);

router
  .route("/:id")
  .get(protect, authorize(["admin", "staff"]), getProductById);

// === PERUBAHAN: Selalu gunakan multer untuk POST dan PUT ===
router
  .route("/")
  .post(protect, authorize("admin"), upload.single("image"), addProduct); // 'image' adalah nama field di form

router
  .route("/:id")
  .put(protect, authorize("admin"), upload.single("image"), updateProduct) // 'image' adalah nama field di form
  .delete(protect, authorize("admin"), deleteProduct);

module.exports = router;
