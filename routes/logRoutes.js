const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { cacheResponse } = require("../middleware/cacheMiddleware"); // Logs can also be cached

const { getAllLogs, getUserLogs } = require("../controllers/logController");

// Route to get all activity logs (only accessible by Admin, responses are cached)
router.get("/", protect, authorize("admin"), cacheResponse, getAllLogs);

// Route to get logs for a specific user (only accessible by Admin)
router.get("/user/:userId", protect, authorize("admin"), getUserLogs);

module.exports = router;
