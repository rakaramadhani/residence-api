const jwt = require('jsonwebtoken');

const authenticatePenghuni = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const secret = process.env.SECRET_KEY;
        const cleanToken = token.replace("Bearer ", "");
        const decoded = jwt.verify(cleanToken, secret);
        if (decoded.role !== "penghuni") {
            return res.status(403).json({ message: "This page only for user" });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};

module.exports = { authenticatePenghuni };
