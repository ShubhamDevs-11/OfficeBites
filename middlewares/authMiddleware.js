const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const verifyToken = (req, res, next) => {
    try {
        const tokenFromCookie = req.cookies?.token;
        const authHeader = req.headers.authorization || "";
        const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
        const token = tokenFromCookie || tokenFromHeader;

        if (!token) {
            logger.warn("Auth middleware — no token found", { url: req.url });
            return res.status(401).json({ message: "Access denied. Please login." });
        }

        if (!process.env.JWT_SECRET) {
            logger.error("Auth middleware — JWT secret missing");
            return res.status(500).json({ message: "Server misconfiguration." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        logger.debug("Auth middleware — token verified", { userId: decoded.userId, role: decoded.role });

        next();

    } catch (error) {
        logger.warn("Auth middleware — invalid token", { error: error.message });
        return res.status(401).json({ message: "Invalid or expired token. Please login again." });
    }
};

// ROLE GUARD — use after verifyToken
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            logger.warn("Auth middleware — unauthorized role", { 
                userId: req.user.userId, 
                role: req.user.role, 
                required: roles 
            });
            return res.status(403).json({ message: "You are not authorized to access this." });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };