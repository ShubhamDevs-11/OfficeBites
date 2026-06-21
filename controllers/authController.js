const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// HELPER — generate JWT
const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// HELPER — set cookie
const sendCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
const register = async (req, res) => {
    try {
        const { userName, email, password, role, companyName, phone } = req.body;

        logger.debug("Register attempt", { email, role });

        // validate role
        if (!["owner", "client", "deliveryAgent"].includes(role)) {
            logger.warn("Register failed — invalid role", { role });
            return res.status(400).json({ message: "Invalid role" });
        }

        // check duplicate email
        const existing = await User.findOne({ email });
        if (existing) {
            logger.warn("Register failed — email already exists", { email });
            return res.status(409).json({ message: "Email already registered" });
        }

        // role based field validation
        if (role === "deliveryAgent" && !phone) {
            logger.warn("Register failed — phone missing", { email });
            return res.status(400).json({ message: "Phone is required for delivery agents" });
        }
        if ((role === "owner" || role === "client") && !companyName) {
            logger.warn("Register failed — companyName missing", { email, role });
            return res.status(400).json({ message: "Company name is required" });
        }

        // create user
        const userData = {
            userName,
            email,
            password,
            role,
        };
        if (role === "deliveryAgent") {
            userData.phone = phone;
        } else {
            userData.companyName = companyName;
        }
        // create user
        const user = await User.create(userData);
               
        logger.info("User registered", { userId: user._id, email, role });

        const token = generateToken(user._id, role);
        sendCookie(res, token);

        return res.status(201).json({
            message: "Registered successfully",
            user: { id: user._id, userName: user.userName, email: user.email, role },
        });

    } catch (error) {
        logger.error("Register error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
const login = async (req, res) => {
    try {
        const { email, password } = req.body;          

        logger.debug("Login attempt", { email });

        const user = await User.findOne({ email });
        if (!user) {
            logger.warn("Login failed — user not found", { email });
            return res.status(404).json({ message: "User not found" });
        }

        // check active
        if (!user.isActive) {
            logger.warn("Login failed — account deactivated", { email });
            return res.status(403).json({ message: "Account is deactivated" });
        }

        // check lock
        if (user.lockUntil && (user.lockUntil > Date.now())) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            logger.warn("Login failed — account locked", { email, minutesLeft });
            return res.status(423).json({
                message: `Account locked. Try again in ${minutesLeft} minute(s)`,
            });
        }

        // check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await user.recordLoginFailure();
            const attemptsLeft = 5 - user.loginAttempts;
            logger.warn("Login failed — wrong password", { email, attemptsLeft });
            return res.status(401).json({
                message: attemptsLeft > 0
                    ? `Wrong password. ${attemptsLeft} attempt(s) left`
                    : "Account locked for 15 minutes",
            });
        }

        await user.resetLoginAttempts();
        logger.info("User logged in", { userId: user._id, email, role: user.role });

        const token = generateToken(user._id, user.role);
        sendCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            user: { id: user._id, userName: user.userName, email: user.email, role: user.role },
        });

    } catch (error) {
        logger.error("Login error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        logger.info("User logged out", { userId: req.user?.userId });
        return res.status(200).json({ message: "Logged out successfully" });

    } catch (error) {
        logger.error("Logout error", { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { register, login, logout };