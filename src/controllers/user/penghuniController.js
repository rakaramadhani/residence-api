const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getFamilyData = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.penghuni.findMany({ where: { userId: user_id } });
        if (!data.length) {
            return res.status(200).json({ message: "No data found" });
        }
        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const createFamilyData = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Tangani input satu data atau banyak data
        const isArray = Array.isArray(req.body);
        const rawData = isArray ? req.body : [req.body]; // jadikan array jika bukan

        // Validasi & siapkan data
        const formattedData = rawData.map(data => {
            const { nama, nik, gender } = data;
            if (!nama || !nik || !gender) {
                throw new Error("Setiap data harus memiliki 'nama', 'nik', dan 'gender'");
            }
            return {
                nama,
                nik,
                gender,
                userId: user_id,
            };
        });

        // Simpan data
        const newFamilyData = await prisma.penghuni.createMany({
            data: formattedData,
            skipDuplicates: true
        });

        res.status(201).json({ message: "Success", count: newFamilyData.count });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const updateFamilyData = async (req, res) => {
    try {
        const { user_id, id } = req.params;
    
        // Ambil hanya field yang boleh di-update
        const { nama, nik, gender } = req.body;

        // Siapkan objek data yang akan di-update (jika field ada)
        const dataToUpdate = {};
        if (nama !== undefined) dataToUpdate.nama = nama;
        if (nik !== undefined) dataToUpdate.nik = nik;
        if (gender !== undefined) dataToUpdate.gender = gender;

        // Cek kalau tidak ada data untuk di-update
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: "Tidak ada data yang diberikan untuk di-update." });
        }

        const updatedFamilyData = await prisma.penghuni.update({
            where: {
                id: id,
                userId: user_id
            },
            data: dataToUpdate
        });

        res.status(200).json({ message: "Success", data: updatedFamilyData });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const deleteFamilyData = async (req, res) => {
    try {
        const { user_id, id } = req.params;
        const deleted = await prisma.penghuni.delete({
            where: { id: id, userId: user_id }
        });
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


module.exports = { getFamilyData, createFamilyData, updateFamilyData, deleteFamilyData };
