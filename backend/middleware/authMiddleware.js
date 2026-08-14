const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "mysecretkey";

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. Token required."
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Token missing"
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

function authorize(role) {
    return function (req, res, next) {
        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (req.user.role !== role) {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        next();
    };
}

module.exports = {
    authenticate: authenticate,
    authorize: authorize
};