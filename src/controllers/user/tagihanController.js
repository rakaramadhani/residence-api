const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTagihan = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.tagihan.findMany({
            where: { userId: user_id , status_bayar: "belumLunas" }, orderBy: { createdAt: 'desc' }
        });
        if (!data.length) {
            return res.status(200).json({ message: "Belum ada tagihan" });
        }
        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const getRiwayatTagihan = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.tagihan.findMany({
            where: {
                userId: user_id,
                status_bayar: "lunas"
            },
            include: {
                transaksi: {
                    select: {
                        id: true,
                        grossAmount: true,
                        currency: true,
                        paymentType: true,
                        settlementTime: true,
                        transactionStatus: true,
                    },
                },
            }, orderBy: {
                createdAt: 'desc',
            },
        });

        if (!data.length) {
            return res.status(200).json({ message: "No paid invoices found" });
        }

        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



module.exports = {
    getTagihan,
    getRiwayatTagihan,
};