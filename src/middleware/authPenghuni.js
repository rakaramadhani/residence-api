const jwt = require('jsonwebtoken');

const authenticatePenghuni = (req, res, next) => {
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
        const secret = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== "penghuni") {
            return res.status(403).json({ message: "This page only for user" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: "Jwt expired" });
        }
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = { authenticatePenghuni };
