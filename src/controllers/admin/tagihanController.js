const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { getJakartaDate, getJakartaISO } = require('../../utils/timezone');
const prisma = new PrismaClient();

const getTagihan = async (req, res) => {
    try {
        const allUsers = await prisma.tagihan.findMany({include: {user: true}});
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
  
      res.status(200).json({
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


// Fungsi untuk membuat tagihan bulanan
const generateTagihanBulanan = async () => {
  try {
    console.log('Menjalankan generate tagihan otomatis...');
    
    // Ambil semua user dengan role "penghuni"
    const users = await prisma.user.findMany({
      where: {
        role: "penghuni"
      },
      include: {
        clusterRef: true
      }
    });

    // Cek apakah ada user yang memenuhi syarat
    if (users.length === 0) {
      console.log('Tidak ada pengguna yang memenuhi syarat untuk generate tagihan');
      return;
    }

    // Gunakan waktu Jakarta/WIB untuk menentukan bulan dan tahun
    const jakartaDate = getJakartaDate();
    const bulan = jakartaDate.getMonth() + 1;
    const tahun = jakartaDate.getFullYear();
    
    console.log(`Generate tagihan untuk bulan ${bulan}/${tahun} (waktu Jakarta: ${jakartaDate.toISOString()})`);
    const tagihanList = [];

    for (const user of users) {
      // Cek apakah sudah ada tagihan untuk user ini di bulan dan tahun yang sama
      const existingTagihan = await prisma.tagihan.findFirst({
        where: {
          userId: user.id,
          bulan,
          tahun
        }
      });

      // Jika belum ada tagihan, buat tagihan baru
      if (!existingTagihan) {
        // Tentukan nominal berdasarkan cluster
        let nominal = 150000; // Default jika tidak ada cluster
        if (user.clusterRef) {
          nominal = user.clusterRef.nominal_tagihan;
        }
        
        const tagihan = await prisma.tagihan.create({
          data: {
            userId: user.id,
            metode_bayar: "otomatis",
            bulan,
            tahun,
            nominal,
            status_bayar: "belumLunas"
          },
        });
        tagihanList.push(tagihan);
      }
    }

    console.log(`Berhasil generate ${tagihanList.length} tagihan untuk bulan ${bulan}/${tahun}`);
  } catch (error) {
    console.error('Error saat generate tagihan otomatis:', error);
  }
};
  
  // Jadwalkan cron job untuk berjalan setiap tanggal 1 bulan pada jam 07:30 WIB
  // Ini akan memastikan tagihan dibuat pada bulan yang tepat menurut waktu Indonesia
  // Format cron: minute hour day-of-month month day-of-week
  const schedulerTagihan = cron.schedule('30 7 1 * *', generateTagihanBulanan, {
    timezone: "Asia/Jakarta" // Timezone Indonesia
  });
  
  // Fungsi untuk memulai scheduler
  const startScheduler = () => {
    schedulerTagihan.start();
    console.log('Scheduler tagihan otomatis telah dimulai');
    
    // Jalankan langsung untuk pengujian (opsional, hapus di production)
    // generateTagihanBulanan();
  };

// Fungsi untuk generate tagihan manual berdasarkan user yang dipilih
const generateTagihanManual = async (req, res) => {
  try {
    const { userIds, bulan, tahun, useClusterNominal = true } = req.body;
    let { nominal } = req.body;
    
    // Validasi input
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Daftar user ID harus diisi" });
    }
    
    if (!bulan || !tahun) {
      return res.status(400).json({ message: "Bulan dan tahun wajib diisi" });
    }
    
    // Jika useClusterNominal false, harus ada nominal
    if (!useClusterNominal && !nominal) {
      return res.status(400).json({ message: "Nominal wajib diisi jika tidak menggunakan nominal cluster" });
    }

    const bulanInt = parseInt(bulan, 10);
    const tahunInt = parseInt(tahun, 10);
    
    if (nominal) {
      nominal = parseInt(nominal, 10);
    }
    
    // Validasi bulan dan tahun
    if (bulanInt < 1 || bulanInt > 12) {
      return res.status(400).json({ message: "Bulan harus antara 1-12" });
    }
    
    if (tahunInt < 2000 || tahunInt > 2100) {
      return res.status(400).json({ message: "Tahun tidak valid" });
    }

    const tagihanList = [];
    const errorList = [];

    // Proses setiap user ID
    for (const userId of userIds) {
      try {
        // Cek apakah user ada
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            clusterRef: true
          }
        });

        if (!user) {
          errorList.push({ userId, error: "User tidak ditemukan" });
          continue;
        }

        // Cek apakah sudah ada tagihan untuk user ini di bulan dan tahun yang sama
        const existingTagihan = await prisma.tagihan.findFirst({
          where: {
            userId,
            bulan: bulanInt,
            tahun: tahunInt
          }
        });

        // Jika sudah ada tagihan, catat sebagai error
        if (existingTagihan) {
          errorList.push({ 
            userId, 
            error: "Tagihan untuk bulan dan tahun ini sudah ada" 
          });
          continue;
        }

        // Tentukan nominal
        let tagihanNominal;
        if (useClusterNominal && user.clusterRef) {
          tagihanNominal = user.clusterRef.nominal_tagihan;
        } else {
          tagihanNominal = nominal || 50000; // Default jika tidak ada nominal yang ditentukan
        }

        // Buat tagihan baru
        const tagihan = await prisma.tagihan.create({
          data: {
            userId,
            metode_bayar: "otomatis",
            bulan: bulanInt,
            tahun: tahunInt,
            nominal: tagihanNominal,
            status_bayar: "belumLunas"
          },
        });
        
        tagihanList.push(tagihan);
      } catch (error) {
        errorList.push({ userId, error: error.message });
      }
    }
    
    res.status(200).json({ 
      message: "Proses generate tagihan manual selesai", 
      berhasil: tagihanList.length,
      gagal: errorList.length,
      data: {
        berhasil: tagihanList,
        gagal: errorList
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const deleteTagihan = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tagihan.delete({ where: { id } });
    res.status(200).json({ message: "Tagihan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { getTagihan, generateTagihanBulanan, updateTagihan, getTagihanSummary, startScheduler, generateTagihanManual, deleteTagihan };