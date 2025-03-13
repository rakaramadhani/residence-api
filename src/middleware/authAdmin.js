const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin only" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = { authenticateAdmin };
