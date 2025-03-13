const { PrismaClient } = require('@prisma/client');
    
const prisma = new PrismaClient();

const kendala = async (req, res) => {
    try {
        const allUsers = await prisma.kendala.findMany({});
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const allUsers = await prisma.kendala.update({
            
        });
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {kendala, update}