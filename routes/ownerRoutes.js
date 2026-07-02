const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
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

// Page views
router.get("/profile", verifyToken, (req, res) => res.render("ownerProfile"));
router.get("/items", verifyToken, (req, res) => res.render("ownerItems"));
router.get("/offices", verifyToken, (req, res) => res.render("ownerOffices"));
router.get("/agents", verifyToken, (req, res) => res.render("ownerAgents"));
router.get("/bills", verifyToken, (req, res) => res.render("ownerBills"));

// Profile API
router.get("/profile-data", verifyToken, getProfile);
router.patch("/profile", verifyToken, editProfile);
router.patch("/profile/password", verifyToken, changePassword);

// Menu API
router.post("/items", verifyToken, addItem);
router.patch("/items/:id", verifyToken, editItem);
router.delete("/items/:id", verifyToken, removeItem);
router.patch("/items/:id/toggle", verifyToken, toggleAvailability);

// Office API
router.post("/offices", verifyToken, addOffice);
router.patch("/offices/:id", verifyToken, editOffice);
router.delete("/offices/:id", verifyToken, removeOffice);
router.patch("/offices/:id/status", verifyToken, toggleOfficeStatus);

// Agent API
router.get("/agents-data", verifyToken, getAgents);
router.post("/agents", verifyToken, addAgent);
router.delete("/agents/:id", verifyToken, removeAgent);

// Billing API
router.get("/bills-data", verifyToken, getBills);
router.post("/bills", verifyToken, createBill);
router.get("/bills/office/:officeId", verifyToken, getOfficeBills);
router.patch("/bills/:id/pay", verifyToken, markBillPaid);
router.delete("/bills/:id", verifyToken, deleteBill);

module.exports = router;
