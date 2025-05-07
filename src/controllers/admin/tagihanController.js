const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getTagihan = async (req, res) => {
    try {
        const allUsers = await prisma.tagihan.findMany({});
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const getTagihanSummary = async (req, res) => {
    try {
      const { bulan, tahun } = req.query;
      if (!bulan || !tahun) {
        return res.status(400).json({ message: "Bulan dan tahun wajib diisi" });
      }
  
      const bulanInt = parseInt(bulan, 10);
      const tahunInt = parseInt(tahun, 10);
  
      // Ambil semua tagihan bulan & tahun ini
      const tagihanBulanIni = await prisma.tagihan.findMany({
        where: {
          bulan: bulanInt,
          tahun: tahunInt,
        },
      });
  
      // Hitung total lunas
      const totalLunas = tagihanBulanIni
        .filter((t) => t.status_bayar === "lunas")
        .reduce((sum, t) => sum + t.nominal, 0);
  
      // Hitung jumlah user lunas & belum lunas
      const jumlahLunas = tagihanBulanIni.filter((t) => t.status_bayar === "lunas").length;
      const jumlahBelumLunas = tagihanBulanIni.filter((t) => t.status_bayar === "belumLunas").length;
  
      res.json({
        totalLunas,
        jumlahLunas,
        jumlahBelumLunas,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };

const updateTagihan = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = {}; // Objek kosong untuk menyimpan data yang akan diupdate
        if (req.body.status_bayar) updateData.status_bayar = req.body.status_bayar;
        if (req.body.metode_bayar) updateData.metode_bayar = req.body.metode_bayar;
        if (req.body.nominal) updateData.nominal = req.body.nominal;
        const tagihan = await prisma.tagihan.update({
            where: { id },
            data: updateData, // Hanya update kolom yang dikirim
        });
        res.status(200).json({ success: true, data: tagihan });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


const createTagihan = async (req, res) => {
    try {
        // Ambil parameter pengecualian dari body request (opsional)
        const { userIds } = req.body; // Array of user IDs (jika hanya untuk user tertentu)

        // Ambil semua user yang memiliki role "penghuni"
        let users = await prisma.user.findMany({
            where: {
                role: "penghuni",
                ...(userIds && { id: { in: userIds } }) // Filter jika hanya user tertentu
            }
        });

        // Cek apakah ada user yang memenuhi syarat
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Tidak ada pengguna yang memenuhi syarat" });
        }

        const bulan = new Date().getMonth() + 1;
        const tahun = new Date().getFullYear();
        const tagihanList = [];

        for (const user of users) {
            const tagihan = await prisma.tagihan.create({
                data: {
                    userId: user.id,
                    metode_bayar: "otomatis",
                    bulan,
                    tahun,
                    nominal: 50000,
                },
            });
            tagihanList.push(tagihan);
        }

        res.status(201).json({ success: true, data: tagihanList });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { getTagihan, createTagihan, updateTagihan, getTagihanSummary };