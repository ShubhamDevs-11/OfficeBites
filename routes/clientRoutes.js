const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const { viewMenu, viewOrders, viewBills } = require("../controllers/clientController");

router.get("/menu", verifyToken, authorizeRoles("client"), viewMenu);
router.get("/orders", verifyToken, authorizeRoles("client"), viewOrders);
router.get("/bills", verifyToken, authorizeRoles("client"), viewBills);

module.exports = router;