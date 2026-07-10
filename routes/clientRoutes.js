const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const { getProfile, changePassword, viewMenu, viewOrders, viewBills } = require("../controllers/clientController");

// Page views
router.get("/profile", verifyToken, authorizeRoles("client"), (req, res) => res.render("client/profile"));
router.get("/menu", verifyToken, authorizeRoles("client"), (req, res) => res.render("client/menu"));
router.get("/orders", verifyToken, authorizeRoles("client"), (req, res) => res.render("client/order"));
router.get("/bills", verifyToken, authorizeRoles("client"), (req, res) => res.render("client/bills"));

// Data API
router.get("/profile-data", verifyToken, authorizeRoles("client"), getProfile);
router.patch("/profile/password", verifyToken, authorizeRoles("client"), changePassword);
router.get("/menu-data", verifyToken, authorizeRoles("client"), viewMenu);
router.get("/orders-data", verifyToken, authorizeRoles("client"), viewOrders);
router.get("/bills-data", verifyToken, authorizeRoles("client"), viewBills);

module.exports = router;

