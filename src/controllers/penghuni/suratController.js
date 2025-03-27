const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSurat = async (req, res) => {
    try {
        const { user_id } = req.params;
        const surat = await prisma.surat.findMany({
            where: { userId: user_id },
        });
        if (!surat.length) {
            return res.status(200).json({ message: "No surat found" });
        }
        res.status(200).json({ message: "Success", data: surat });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const createSurat = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { deskripsi } = req.body; // Jenis surat yang akan dibuat

        // Ambil user beserta semua anggotanya
        const user = await prisma.user.findUnique({
            where: { id: user_id },
            include: { anggota: true },
        });

        // Jika user tidak ditemukan atau tidak memiliki anggota
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.anggota.length === 0) {
            return res.status(400).json({ message: "User has no anggota" });
        }

        // Buat data untuk disimpan
        const suratData = user.anggota.map(anggota => ({
            userId: user.id,
            anggotaId: anggota.id,
            deskripsi: deskripsi,
        }));

        // Simpan semua data surat sekaligus
        const surat = await prisma.surat.createMany({
            data: suratData,
        });

        res.status(201).json({ message: "Surat created successfully", count: surat.count });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const deleteSurat = async (req, res) => {
    try {
        const { id } = req.params;
        const surat = await prisma.surat.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Surat deleted successfully", surat });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}


module.exports = { getSurat, createSurat, deleteSurat};
    
    
