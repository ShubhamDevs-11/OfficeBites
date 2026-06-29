const Menu = require("../models/menu_model");
const User = require("../models/user_model");
const logger = require("../utils/logger");

// ─────────────────────────────────────────
// GET PROFILE
// ─────────────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password -loginAttempts -lockUntil");

        if (!user) {
            logger.warn("getProfile — user not found", { userId: req.user.userId });
            return res.status(404).json({ message: "User not found" });
        }

        logger.info("getProfile — success", { userId: user._id });
        return res.status(200).json({ user });

    } catch (error) {
        logger.error("getProfile error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// EDIT PROFILE
// ─────────────────────────────────────────
const editProfile = async (req, res) => {
    try {
        const { userName, companyName } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { userName, companyName },
            { new: true, runValidators: true }
        ).select("-password -loginAttempts -lockUntil");

        if (!user) {
            logger.warn("editProfile — user not found", { userId: req.user.userId });
            return res.status(404).json({ message: "User not found" });
        }

        logger.info("editProfile — success", { userId: user._id });
        return res.status(200).json({ message: "Profile updated", user });

    } catch (error) {
        logger.error("editProfile error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// CHANGE PASSWORD
// ─────────────────────────────────────────
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            logger.warn("changePassword — user not found", { userId: req.user.userId });
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) {
            logger.warn("changePassword — wrong old password", { userId: user._id });
            return res.status(401).json({ message: "Old password is incorrect" });
        }

        user.password = newPassword;
        await user.save();

        logger.info("changePassword — success", { userId: user._id });
        return res.status(200).json({ message: "Password changed successfully" });

    } catch (error) {
        logger.error("changePassword error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};
//Menu Functions
const addItem = async (req,res)=>{
    try {
        const {itemName,itemPhoto,itemPrice} = req.body;
        
        logger.debug("addItem attempt",{userId:req.user.userId});

        const item =await Menu.create({
            itemName,
            itemPhoto,
            itemPrice,
            owner:req.user.userId
        });
        logger.info("Item added", { itemId: item._id, userId: req.user.userId });
        return res.status(201).json({ message: "Item added successfully", item });
    } catch (error) {
        logger.error("addItem error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ─────────────────────────────────────────
// EDIT ITEM
// ─────────────────────────────────────────
const editItem = async (req, res) => {
    try {
        const { itemName, itemPhoto, itemPrice } = req.body;
        const { id } = req.params;

        logger.debug("editItem attempt", { itemId: id, userId: req.user.userId });

        const item = await Menu.findOne({ _id: id, owner: req.user.userId });
        if (!item) {
            logger.warn("editItem — item not found or unauthorized", { itemId: id, userId: req.user.userId });
            return res.status(404).json({ message: "Item not found" });
        }

        if (itemName) item.itemName = itemName;
        if (itemPhoto) item.itemPhoto = itemPhoto;
        if (itemPrice) item.itemPrice = itemPrice;

        await item.save();

        logger.info("Item updated", { itemId: item._id, userId: req.user.userId });
        return res.status(200).json({ message: "Item updated successfully", item });

    } catch (error) {
        logger.error("editItem error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// REMOVE ITEM
// ─────────────────────────────────────────
const removeItem = async (req, res) => {
    try {
        const { id } = req.params;

        logger.debug("removeItem attempt", { itemId: id, userId: req.user.userId });

        const item = await Menu.findOneAndDelete({ _id: id, owner: req.user.userId });
        if (!item) {
            logger.warn("removeItem — item not found or unauthorized", { itemId: id, userId: req.user.userId });
            return res.status(404).json({ message: "Item not found" });
        }

        logger.info("Item removed", { itemId: id, userId: req.user.userId });
        return res.status(200).json({ message: "Item removed successfully" });

    } catch (error) {
        logger.error("removeItem error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// TOGGLE AVAILABILITY
// ─────────────────────────────────────────
const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;

        logger.debug("toggleAvailability attempt", { itemId: id, userId: req.user.userId });

        const item = await Menu.findOne({ _id: id, owner: req.user.userId });
        if (!item) {
            logger.warn("toggleAvailability — item not found or unauthorized", { itemId: id });
            return res.status(404).json({ message: "Item not found" });
        }

        item.isAvailable = !item.isAvailable;
        await item.save();

        logger.info("Item availability toggled", { itemId: id, isAvailable: item.isAvailable });
        return res.status(200).json({ 
            message: `Item marked as ${item.isAvailable ? "available" : "unavailable"}`,
            isAvailable: item.isAvailable
        });

    } catch (error) {
        logger.error("toggleAvailability error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};
module.exports = { getProfile, editProfile, changePassword , addItem ,editItem , removeItem};