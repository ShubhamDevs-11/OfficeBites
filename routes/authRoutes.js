const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

module.exports = router;