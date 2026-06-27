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

module.exports = { getProfile, editProfile, changePassword };