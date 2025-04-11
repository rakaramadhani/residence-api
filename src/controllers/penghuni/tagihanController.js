const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTagihan = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.tagihan.findMany({
            where: { userId: user_id }
        });
        if (!data.length) {
            return res.status(200).json({ message: "No data found" });
        }
        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



module.exports = {
    getTagihan,
};