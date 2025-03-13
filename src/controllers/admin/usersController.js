const { PrismaClient } = require('@prisma/client');
    
const prisma = new PrismaClient();

const users = async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany({
            where: {
                role: "penghuni"
            }
        });

        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {users}