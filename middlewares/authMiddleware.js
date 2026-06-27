const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

// VERIFY TOKEN
const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            logger.warn("No token found", { url: req.url });
            return res.status(401).json({ message: "Access denied. Please login." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, role }

        logger.debug("Token verified", { userId: decoded.userId, role: decoded.role });
        next();

    } catch (error) {
        logger.warn("Invalid token", { error: error.message });
        return res.status(401).json({ message: "Invalid or expired token. Please login again." });
    }
};

// ROLE GUARD
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            logger.warn("Unauthorized role", { userId: req.user.userId, role: req.user.role });
            return res.status(403).json({ message: "You are not authorized." });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };