const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/authController");

// Public route for user login
router.post("/login", loginUser);

module.exports = router;
