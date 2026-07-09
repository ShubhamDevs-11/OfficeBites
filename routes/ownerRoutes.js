const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  getProfile,
  editProfile,
  changePassword,
  addItem,
  editItem,
  removeItem,
  toggleAvailability,
  addOffice,
  editOffice,
  removeOffice,
  toggleOfficeStatus,
  addAgent,
  removeAgent,
  getAgents,
  createBill,
  getBills,
  getOfficeBills,
  markBillPaid,
  deleteBill,
} = require("../controllers/ownerController");

// Profile API
router.get("/profile-data", verifyToken, authorizeRoles("owner"), getProfile);
router.patch("/profile", verifyToken, authorizeRoles("owner"), editProfile);
router.patch("/profile/password", verifyToken, authorizeRoles("owner"), changePassword);

// Menu API
router.post("/items", verifyToken, authorizeRoles("owner"), addItem);
router.patch("/items/:id", verifyToken, authorizeRoles("owner"), editItem);
router.delete("/items/:id", verifyToken, authorizeRoles("owner"), removeItem);
router.patch("/items/:id/toggle", verifyToken, authorizeRoles("owner"), toggleAvailability);

// Office API
router.post("/offices", verifyToken, authorizeRoles("owner"), addOffice);
router.patch("/offices/:id", verifyToken, authorizeRoles("owner"), editOffice);
router.delete("/offices/:id", verifyToken, authorizeRoles("owner"), removeOffice);
router.patch("/offices/:id/status", verifyToken, authorizeRoles("owner"), toggleOfficeStatus);

// Agent API
router.get("/agents-data", verifyToken, authorizeRoles("owner"), getAgents);
router.post("/agents", verifyToken, authorizeRoles("owner"), addAgent);
router.delete("/agents/:id", verifyToken, authorizeRoles("owner"), removeAgent);

// Billing API
router.get("/bills-data", verifyToken, authorizeRoles("owner"), getBills);
router.post("/bills", verifyToken, authorizeRoles("owner"), createBill);
router.get("/bills/office/:officeId", verifyToken, authorizeRoles("owner"), getOfficeBills);
router.patch("/bills/:id/pay", verifyToken, authorizeRoles("owner"), markBillPaid);
router.delete("/bills/:id", verifyToken, authorizeRoles("owner"), deleteBill);

module.exports = router;
