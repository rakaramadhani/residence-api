const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkVerified = async (req, res, next) => {
    try {
        // Get user ID from request (set by auth middleware)
        const userId = req.user.id;
        
        // Query user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { isVerified: true }
        });

        // Check verification status
        if (!user || user.isVerified !== true) {
            return res.status(403).json({ 
                message: "Access denied - account not verified" 
            });
        }

        // User is verified, continue to next middleware
        next();
    } catch (error) {
        console.error("Verification check error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { checkVerified };
