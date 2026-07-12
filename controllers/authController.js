const User = require("../models/user(auth)_model");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// HELPER — generate JWT
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
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

const isHtmlRequest = (req) => {
  return req.accepts(["html", "json"]) === "html";
};

const renderLogin = (res, status, error, success, email = "") => {
  return res.status(status).render("login", {
    error,
    success,
    email,
  });
};

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { userName, email, password, companyName } = req.body;
    const ownerRole = "owner";

    logger.debug("Register attempt", { email });

    // check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn("Register failed — email already exists", { email });
      return res.status(409).json({ message: "Email already registered" });
    }

    if (!companyName) {
      return res.status(400).json({ message: "Company name is required" });
    }

    // create owner user
    const userData = {
      userName,
      email,
      password,
      role: ownerRole,
      companyName,
    };

    const user = await User.create(userData);

    logger.info("User registered", { userId: user._id, email, role: ownerRole });

    const token = generateToken(user._id, ownerRole);
    sendCookie(res, token);

    return res.status(201).json({
      message: "Registered successfully",
      user: { id: user._id, userName: user.userName, email: user.email, role: ownerRole },
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
        const { identifier, password } = req.body;
        const loginIdentifier = identifier?.trim();

        logger.debug("Login attempt", { identifier: loginIdentifier });

        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: "Email/phone and password are required" });
        }

        const user = await User.findOne({
            $or: [{ email: loginIdentifier }, { phone: loginIdentifier }],
        });
        if (!user) {
            logger.warn("Login failed — user not found", { identifier: loginIdentifier });
            return res.status(404).json({ message: "User not found" });
        }

        // check active
        if (!user.isActive) {
            logger.warn("Login failed — account deactivated", { identifier: loginIdentifier });
            return res.status(403).json({ message: "Account is deactivated" });
        }

        // check lock
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            logger.warn("Login failed — account locked", { identifier: loginIdentifier, minutesLeft });
            return res.status(423).json({
                message: `Account locked. Try again in ${minutesLeft} minute(s)`,
            });
        }

        // check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            await user.recordLoginFailure();
            const attemptsLeft = 5 - user.loginAttempts;
            const message = attemptsLeft > 0
                ? `Wrong password. ${attemptsLeft} attempt(s) left`
                : "Account locked for 15 minutes";
            logger.warn("Login failed — wrong password", { identifier: loginIdentifier, attemptsLeft });
            return res.status(401).json({ message });
        }

        await user.resetLoginAttempts();
        logger.info("User logged in", { userId: user._id, identifier: loginIdentifier, role: user.role });

        const token = generateToken(user._id, user.role);
        sendCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                userName: user.userName,
                email: user.email,
                role: user.role,
            },
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
