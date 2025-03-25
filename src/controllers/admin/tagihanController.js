const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTagihan = async (req, res) => {
    try {
        const allUsers = await prisma.iuran.findMany({});
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const createTagihan = async (req, res) => {
    const { userId, bulan, tahun, nominal } = req.body;
    try {
        const tagihan = await prisma.iuran.create({
            data: { userId, bulan, tahun, nominal },
    });
    res.status(201).json({ success: true, data: tagihan });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { getTagihan, createTagihan };