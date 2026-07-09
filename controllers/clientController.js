const Menu = require("../models/menu_model");
const Order = require("../models/order_model");
const Bill = require("../models/bill_model");
const User = require("../models/user(auth)_model");
const logger = require("../utils/logger");

// ─────────────────────────────────────────
// VIEW MENU (read-only)
// ─────────────────────────────────────────
const viewMenu = async (req, res) => {
    try {
        logger.debug("viewMenu attempt", { userId: req.user.userId });

        const items = await Menu.find({ isAvailable: true }).select("-owner");

        logger.info("Menu fetched", { count: items.length, userId: req.user.userId });
        return res.status(200).json({ items });

    } catch (error) {
        logger.error("viewMenu error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// VIEW ORDERS (for this client's office)
// ─────────────────────────────────────────
const viewOrders = async (req, res) => {
    try {
        logger.debug("viewOrders attempt", { userId: req.user.userId });

        // find the client's office first
        const client = await User.findById(req.user.userId);
        if (!client || !client.office) {
            logger.warn("viewOrders — client has no office assigned", { userId: req.user.userId });
            return res.status(404).json({ message: "No office assigned to this account" });
        }

        const orders = await Order.find({ office: client.office })
            .populate("deliveryAgent", "userName phone")
            .sort({ deliveredAt: -1 });

        logger.info("Orders fetched", { count: orders.length, userId: req.user.userId });
        return res.status(200).json({ orders });

    } catch (error) {
        logger.error("viewOrders error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// VIEW BILLS (for this client's office)
// ─────────────────────────────────────────
const viewBills = async (req, res) => {
    try {
        logger.debug("viewBills attempt", { userId: req.user.userId });

        const client = await User.findById(req.user.userId);
        if (!client || !client.office) {
            logger.warn("viewBills — client has no office assigned", { userId: req.user.userId });
            return res.status(404).json({ message: "No office assigned to this account" });
        }

        const bills = await Bill.find({ office: client.office })
            .sort({ year: -1, month: -1 });

        logger.info("Bills fetched", { count: bills.length, userId: req.user.userId });
        return res.status(200).json({ bills });

    } catch (error) {
        logger.error("viewBills error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { viewMenu, viewOrders, viewBills };