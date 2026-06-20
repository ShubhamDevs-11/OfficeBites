const Owner = require("../models/owner.model");
const Client = require("../models/client.model");
const DeliveryAgent = require("../models/deliveryAgent.model");
const jwt = require("jsonwebtoken");

// HELPER
const getModel = (role) => {
    const models = {
        owner: Owner,
        client: Client,
        deliveryAgent: DeliveryAgent,
    };
    return models[role] || null;
};

const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};


// REGISTER
const register = async (req, res) => {
    try {
        const { userName, email, password, role, companyName, phone } = req.body;

        logger.debug("Register attempt", { email, role });

        const Model = getModel(role);
        if (!Model) {
            logger.warn("Register failed — invalid role", { role });
            return res.status(400).json({ message: "Invalid role" });
        }

        const existing = await Model.findOne({ email });
        if (existing) {
            logger.warn("Register failed — email already exists", { email, role });
            return res.status(409).json({ message: "Email already registered" });
        }

        if (role === "deliveryAgent" && !phone) {
            logger.warn("Register failed — phone missing for deliveryAgent", { email });
            return res.status(400).json({ message: "Phone is required for delivery agents" });
        }
        if ((role === "owner" || role === "client") && !companyName) {
            logger.warn("Register failed — companyName missing", { email, role });
            return res.status(400).json({ message: "Company name is required" });
        }

        const userData = { userName, email, password };
        if (role === "deliveryAgent") userData.phone = phone;
        else userData.companyName = companyName;

        const user = await Model.create(userData);

        logger.info("User registered successfully", { userId: user._id, email, role });

        const token = generateToken(user._id, role);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "Registered successfully",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role,
            },
        });

    } catch (error) {
        logger.error("Register error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};