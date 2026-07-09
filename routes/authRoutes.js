const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/register", (req, res) => {
    res.render("auth/register");
});
router.get("/login", (req, res) => {
    res.render("auth/login");
});
router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

module.exports = router;