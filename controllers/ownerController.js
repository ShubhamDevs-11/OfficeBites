const Menu = require("../models/menu_model");
const User = require("../models/user(auth)_model");
const logger = require("../utils/logger");
const Office = require("../models/office_model");
const Bill = require("../models/bill_model");
// ─────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -loginAttempts -lockUntil",
    );

    if (!user) {
      logger.warn("getProfile — user not found", {userId: req.user.userId});
      return res.status(404).json({message: "User not found"});
    }

    logger.info("getProfile — success", {userId: user._id});
    return res.status(200).json({user});
  } catch (error) {
    logger.error("getProfile error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// EDIT PROFILE
// ─────────────────────────────────────────
const editProfile = async (req, res) => {
  try {
    const {userName, companyName} = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {userName, companyName},
      {new: true, runValidators: true},
    ).select("-password -loginAttempts -lockUntil");

    if (!user) {
      logger.warn("editProfile — user not found", {userId: req.user.userId});
      return res.status(404).json({message: "User not found"});
    }

    logger.info("editProfile — success", {userId: user._id});
    return res.status(200).json({message: "Profile updated", user});
  } catch (error) {
    logger.error("editProfile error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      logger.warn("changePassword — user not found", {userId: req.user.userId});
      return res.status(404).json({message: "User not found"});
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      logger.warn("changePassword — wrong old password", {userId: user._id});
      return res.status(401).json({message: "Old password is incorrect"});
    }

    user.password = newPassword;
    await user.save();

    logger.info("changePassword — success", {userId: user._id});
    return res.status(200).json({message: "Password changed successfully"});
  } catch (error) {
    logger.error("changePassword error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};
//Menu Functions
// ─────────────────────────────────────────
// GET ALL ITEMS
// ─────────────────────────────────────────
const getItems = async (req, res) => {
    try {
        logger.debug("getItems attempt", { userId: req.user.userId });

        const items = await Menu.find({ owner: req.user.userId }).sort({ createdAt: -1 });

        logger.info("Items fetched", { count: items.length, userId: req.user.userId });
        return res.status(200).json({ items });

    } catch (error) {
        logger.error("getItems error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};
const addItem = async (req, res) => {
    try {
        const { itemName, itemPrice } = req.body;

        logger.debug("addItem attempt", { userId: req.user.userId });

        // check if file was uploaded
        if (!req.file) {
            logger.warn("addItem — no photo uploaded", { userId: req.user.userId });
            return res.status(400).json({ message: "Item photo is required" });
        }

        // build the path to access this image later
        const itemPhoto = `/uploads/menu/${req.file.filename}`;

        const item = await Menu.create({
            itemName,
            itemPhoto,
            itemPrice,
            owner: req.user.userId,
        });

        logger.info("Item added", { itemId: item._id, userId: req.user.userId });
        return res.status(201).json({ message: "Item added successfully", item });

    } catch (error) {
        logger.error("addItem error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// EDIT ITEM
// ─────────────────────────────────────────
const editItem = async (req, res) => {
  try {
    const {itemName, itemPhoto, itemPrice} = req.body;
    const {id} = req.params;

    logger.debug("editItem attempt", {itemId: id, userId: req.user.userId});

    const item = await Menu.findOne({_id: id, owner: req.user.userId});
    if (!item) {
      logger.warn("editItem — item not found or unauthorized", {
        itemId: id,
        userId: req.user.userId,
      });
      return res.status(404).json({message: "Item not found"});
    }

    if (itemName) item.itemName = itemName;
    if (itemPhoto) item.itemPhoto = itemPhoto;
    if (itemPrice) item.itemPrice = itemPrice;

    await item.save();

    logger.info("Item updated", {itemId: item._id, userId: req.user.userId});
    return res.status(200).json({message: "Item updated successfully", item});
  } catch (error) {
    logger.error("editItem error", {error: error.message, stack: error.stack});
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// REMOVE ITEM
// ─────────────────────────────────────────
const removeItem = async (req, res) => {
  try {
    const {id} = req.params;

    logger.debug("removeItem attempt", {itemId: id, userId: req.user.userId});

    const item = await Menu.findOneAndDelete({_id: id, owner: req.user.userId});
    if (!item) {
      logger.warn("removeItem — item not found or unauthorized", {
        itemId: id,
        userId: req.user.userId,
      });
      return res.status(404).json({message: "Item not found"});
    }

    logger.info("Item removed", {itemId: id, userId: req.user.userId});
    return res.status(200).json({message: "Item removed successfully"});
  } catch (error) {
    logger.error("removeItem error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// TOGGLE AVAILABILITY
// ─────────────────────────────────────────
const toggleAvailability = async (req, res) => {
  try {
    const {id} = req.params;

    logger.debug("toggleAvailability attempt", {
      itemId: id,
      userId: req.user.userId,
    });

    const item = await Menu.findOne({_id: id, owner: req.user.userId});
    if (!item) {
      logger.warn("toggleAvailability — item not found or unauthorized", {
        itemId: id,
      });
      return res.status(404).json({message: "Item not found"});
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    logger.info("Item availability toggled", {
      itemId: id,
      isAvailable: item.isAvailable,
    });
    return res.status(200).json({
      message: `Item marked as ${item.isAvailable ? "available" : "unavailable"}`,
      isAvailable: item.isAvailable,
    });
  } catch (error) {
    logger.error("toggleAvailability error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};
// ─────────────────────────────────────────
// GET ALL OFFICES
// ─────────────────────────────────────────
const getOffices = async (req, res) => {
    try {
        logger.debug("getOffices attempt", { userId: req.user.userId });

        const offices = await Office.find({ owner: req.user.userId })
            .populate("assignedAgent", "userName phone")
            .sort({ createdAt: -1 });

        logger.info("Offices fetched", { count: offices.length, userId: req.user.userId });
        return res.status(200).json({ offices });

    } catch (error) {
        logger.error("getOffices error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};
// ─────────────────────────────────────────
// ADD OFFICE
// ─────────────────────────────────────────
const addOffice = async (req, res) => {
  try {
    const { officeName, address, contactNumber, clientPassword } = req.body;

    logger.debug("addOffice attempt", {userId: req.user.userId});

    const office = await Office.create({
      officeName,
      address,
      contactNumber,
      owner: req.user.userId,
    });

    const initialPassword = clientPassword || contactNumber;
    const existingClient = await User.findOne({ phone: contactNumber });
    if (existingClient) {
      logger.warn("addOffice — client already exists for this phone", { phone: contactNumber });
      return res.status(409).json({ message: "A client account already exists for this contact number" });
    }

    const clientUser = await User.create({
      userName: officeName || "Client",
      email: undefined,
      phone: contactNumber,
      password: initialPassword,
      role: "client",
      office: office._id,
    });

    logger.info("Office added", {
      officeId: office._id,
      userId: req.user.userId,
      clientId: clientUser._id,
    });
    return res.status(201).json({ message: "Office added successfully", office, client: { phone: clientUser.phone } });
  } catch (error) {
    logger.error("addOffice error", {error: error.message, stack: error.stack});
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// EDIT OFFICE
// ─────────────────────────────────────────
const editOffice = async (req, res) => {
  try {
    const {id} = req.params;
    const {officeName, address, contactNumber} = req.body;

    logger.debug("editOffice attempt", {officeId: id, userId: req.user.userId});

    const office = await Office.findOne({_id: id, owner: req.user.userId});
    if (!office) {
      logger.warn("editOffice — not found or unauthorized", {officeId: id});
      return res.status(404).json({message: "Office not found"});
    }

    if (officeName) office.officeName = officeName;
    if (address) office.address = address;
    if (contactNumber) office.contactNumber = contactNumber;

    await office.save();

    logger.info("Office updated", {
      officeId: office._id,
      userId: req.user.userId,
    });
    return res
      .status(200)
      .json({message: "Office updated successfully", office});
  } catch (error) {
    logger.error("editOffice error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// REMOVE OFFICE
// ─────────────────────────────────────────
const removeOffice = async (req, res) => {
  try {
    const {id} = req.params;

    logger.debug("removeOffice attempt", {
      officeId: id,
      userId: req.user.userId,
    });

    const office = await Office.findOneAndDelete({
      _id: id,
      owner: req.user.userId,
    });
    if (!office) {
      logger.warn("removeOffice — not found or unauthorized", {officeId: id});
      return res.status(404).json({message: "Office not found"});
    }

    logger.info("Office removed", {officeId: id, userId: req.user.userId});
    return res.status(200).json({message: "Office removed successfully"});
  } catch (error) {
    logger.error("removeOffice error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// TOGGLE OFFICE STATUS
// ─────────────────────────────────────────
const toggleOfficeStatus = async (req, res) => {
  try {
    const {id} = req.params;

    logger.debug("toggleOfficeStatus attempt", {
      officeId: id,
      userId: req.user.userId,
    });

    const office = await Office.findOne({_id: id, owner: req.user.userId});
    if (!office) {
      logger.warn("toggleOfficeStatus — not found or unauthorized", {
        officeId: id,
      });
      return res.status(404).json({message: "Office not found"});
    }

    office.isActive = !office.isActive;
    await office.save();

    logger.info("Office status toggled", {
      officeId: id,
      isActive: office.isActive,
    });
    return res.status(200).json({
      message: `Office marked as ${office.isActive ? "active" : "inactive"}`,
      isActive: office.isActive,
    });
  } catch (error) {
    logger.error("toggleOfficeStatus error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({message: "Internal server error"});
  }
};

// ─────────────────────────────────────────
// ADD AGENT
// ─────────────────────────────────────────
const addAgent = async (req, res) => {
    try {
        const { userName, email, password, phone } = req.body;

        logger.debug("addAgent attempt", { userId: req.user.userId });

        // check if email already exists
        const existing = await User.findOne({ email });
        if (existing) {
            logger.warn("addAgent — email already exists", { email });
            return res.status(409).json({ message: "Email already registered" });
        }

        const agent = await User.create({
            userName,
            email,
            password,
            phone,
            role: "deliveryAgent",
        });

        logger.info("Agent added", { agentId: agent._id, userId: req.user.userId });
        return res.status(201).json({ message: "Delivery agent added successfully", agent });

    } catch (error) {
        logger.error("addAgent error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// REMOVE AGENT
// ─────────────────────────────────────────
const removeAgent = async (req, res) => {
    try {
        const { id } = req.params;

        logger.debug("removeAgent attempt", { agentId: id, userId: req.user.userId });

        // only delete if they are a deliveryAgent
        const agent = await User.findOneAndDelete({ _id: id, role: "deliveryAgent" });
        if (!agent) {
            logger.warn("removeAgent — agent not found", { agentId: id });
            return res.status(404).json({ message: "Delivery agent not found" });
        }

        logger.info("Agent removed", { agentId: id, userId: req.user.userId });
        return res.status(200).json({ message: "Delivery agent removed successfully" });

    } catch (error) {
        logger.error("removeAgent error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// GET ALL AGENTS
// ─────────────────────────────────────────
const getAgents = async (req, res) => {
    try {
        logger.debug("getAgents attempt", { userId: req.user.userId });

        const agents = await User.find({ role: "deliveryAgent" }).select("-password -loginAttempts -lockUntil");

        logger.info("Agents fetched", { count: agents.length, userId: req.user.userId });
        return res.status(200).json({ agents });

    } catch (error) {
        logger.error("getAgents error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};
//─────────────────────────────────────────
//BILL
//─────────────────────────────────────────

// ─────────────────────────────────────────
// CREATE BILL
// ─────────────────────────────────────────
const createBill = async (req, res) => {
    try {
        const { office, amount, month, year } = req.body;

        logger.debug("createBill attempt", { userId: req.user.userId, office });

        // check office belongs to owner
        const officeExists = await Office.findOne({ _id: office, owner: req.user.userId });
        if (!officeExists) {
            logger.warn("createBill — office not found or unauthorized", { office });
            return res.status(404).json({ message: "Office not found" });
        }

        // prevent duplicate bill for same month
        const existing = await Bill.findOne({ office, month, year });
        if (existing) {
            logger.warn("createBill — bill already exists", { office, month, year });
            return res.status(409).json({ message: "Bill already exists for this month" });
        }

        const bill = await Bill.create({
            office,
            owner: req.user.userId,
            amount,
            month,
            year,
        });

        logger.info("Bill created", { billId: bill._id, userId: req.user.userId });
        return res.status(201).json({ message: "Bill created successfully", bill });

    } catch (error) {
        logger.error("createBill error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// GET ALL BILLS (this owner)
// ─────────────────────────────────────────
const getBills = async (req, res) => {
    try {
        logger.debug("getBills attempt", { userId: req.user.userId });

        const bills = await Bill.find({ owner: req.user.userId })
            .populate("office", "officeName")
            .sort({ year: -1, month: -1 });

        logger.info("Bills fetched", { count: bills.length, userId: req.user.userId });
        return res.status(200).json({ bills });

    } catch (error) {
        logger.error("getBills error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// GET BILLS FOR ONE OFFICE
// ─────────────────────────────────────────
const getOfficeBills = async (req, res) => {
    try {
        const { officeId } = req.params;

        logger.debug("getOfficeBills attempt", { officeId, userId: req.user.userId });

        const bills = await Bill.find({ owner: req.user.userId, office: officeId })
            .sort({ year: -1, month: -1 });

        logger.info("Office bills fetched", { count: bills.length, officeId });
        return res.status(200).json({ bills });

    } catch (error) {
        logger.error("getOfficeBills error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// MARK BILL AS PAID
// ─────────────────────────────────────────
const markBillPaid = async (req, res) => {
    try {
        const { id } = req.params;

        logger.debug("markBillPaid attempt", { billId: id, userId: req.user.userId });

        const bill = await Bill.findOne({ _id: id, owner: req.user.userId });
        if (!bill) {
            logger.warn("markBillPaid — bill not found or unauthorized", { billId: id });
            return res.status(404).json({ message: "Bill not found" });
        }

        bill.status = "paid";
        bill.paidAt = new Date();
        await bill.save();

        logger.info("Bill marked paid", { billId: bill._id, userId: req.user.userId });
        return res.status(200).json({ message: "Bill marked as paid", bill });

    } catch (error) {
        logger.error("markBillPaid error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// DELETE BILL
// ─────────────────────────────────────────
const deleteBill = async (req, res) => {
    try {
        const { id } = req.params;

        logger.debug("deleteBill attempt", { billId: id, userId: req.user.userId });

        const bill = await Bill.findOneAndDelete({ _id: id, owner: req.user.userId });
        if (!bill) {
            logger.warn("deleteBill — bill not found or unauthorized", { billId: id });
            return res.status(404).json({ message: "Bill not found" });
        }

        logger.info("Bill deleted", { billId: id, userId: req.user.userId });
        return res.status(200).json({ message: "Bill deleted successfully" });

    } catch (error) {
        logger.error("deleteBill error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { 
    getProfile, editProfile, changePassword,
    addItem, editItem, removeItem, toggleAvailability, getItems,      
    addOffice, editOffice, removeOffice, toggleOfficeStatus, getOffices, 
    addAgent, removeAgent, getAgents,
    createBill, getBills, getOfficeBills, markBillPaid, deleteBill,
};
