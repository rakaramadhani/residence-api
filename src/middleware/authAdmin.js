const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied" });
    }

    // Extract token dari "Bearer TOKEN_VALUE"
    const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

    if (!token) {
        return res.status(401).json({ message: "Access denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin only" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: "Jwt expired" });
        }
        res.status(400).json({ message: "Invalid JWT" });
    }
};

module.exports = { authenticateAdmin };
