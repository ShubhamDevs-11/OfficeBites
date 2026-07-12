const express = require("express");
const upload = require("../middlewares/uploadMiddleware");
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
  addClient,
  getClients,
  createBill,
  getBills,
  getOfficeBills,
  markBillPaid,
  deleteBill,
  getItems,
  getOffices,
} = require("../controllers/ownerController");


// Page views
router.get("/profile", verifyToken, authorizeRoles("owner"), (req, res) => {
    res.render("owner/profile");
});
router.get("/menu", verifyToken, authorizeRoles("owner"), (req, res) => {
    res.render("owner/menu");
});
router.get("/offices", verifyToken, authorizeRoles("owner"), (req, res) => {
    res.render("owner/offices");
});
router.get("/agents", verifyToken, authorizeRoles("owner"), (req, res) => {
    res.render("owner/agents");
});
router.get("/bills", verifyToken, authorizeRoles("owner"), (req, res) => {
    res.render("owner/bills");
});
// Profile API
router.get("/profile-data", verifyToken, authorizeRoles("owner"), getProfile);
router.patch("/profile", verifyToken, authorizeRoles("owner"), editProfile);
router.patch("/profile/password", verifyToken, authorizeRoles("owner"), changePassword);

// Menu API
router.post("/items", verifyToken, authorizeRoles("owner"), upload.single("itemPhoto"), addItem);
router.patch("/items/:id", verifyToken, authorizeRoles("owner"), editItem);
router.delete("/items/:id", verifyToken, authorizeRoles("owner"), removeItem);
router.patch("/items/:id/toggle", verifyToken, authorizeRoles("owner"), toggleAvailability);
router.get("/items-data", verifyToken, authorizeRoles("owner"), getItems);   

// Office API
router.get("/offices-data", verifyToken, authorizeRoles("owner"), getOffices);  
router.post("/offices", verifyToken, authorizeRoles("owner"), addOffice);
router.patch("/offices/:id", verifyToken, authorizeRoles("owner"), editOffice);
router.delete("/offices/:id", verifyToken, authorizeRoles("owner"), removeOffice);
router.patch("/offices/:id/status", verifyToken, authorizeRoles("owner"), toggleOfficeStatus);

// Agent API
router.get("/agents-data", verifyToken, authorizeRoles("owner"), getAgents);
router.post("/agents", verifyToken, authorizeRoles("owner"), addAgent);
router.delete("/agents/:id", verifyToken, authorizeRoles("owner"), removeAgent);

// Client API
router.post("/clients", verifyToken, authorizeRoles("owner"), addClient);
router.get("/clients-data", verifyToken, authorizeRoles("owner"), getClients);

// Billing API
router.get("/bills-data", verifyToken, authorizeRoles("owner"), getBills);
router.post("/bills", verifyToken, authorizeRoles("owner"), createBill);
router.get("/bills/office/:officeId", verifyToken, authorizeRoles("owner"), getOfficeBills);
router.patch("/bills/:id/pay", verifyToken, authorizeRoles("owner"), markBillPaid);
router.delete("/bills/:id", verifyToken, authorizeRoles("owner"), deleteBill);

module.exports = router;
