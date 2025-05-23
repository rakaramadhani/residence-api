const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateSuratPerizinan } = require('../../utils/pdfGenerator');
const { downloadFileFromStorage, getFileUrl } = require('../../utils/fileHandler');

const getSurat = async (req, res) => {
  try {
    const surat = await prisma.surat.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!surat.length) {
      return res.status(200).json({ message: "No surat found" });
    }
    
    res.status(200).json({ message: "Success", data: surat });
  } catch (error) {
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

const updateSurat = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    // Cek apakah surat ada
    const existingSurat = await prisma.surat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    if (!existingSurat) {
      return res.status(404).json({
        message: "Surat tidak ditemukan"
      });
    }

    // Jika status disetujui, generate PDF
    if (status === "approved") {
      try {
        // Generate PDF dan dapatkan path filenya
        const pdfResult = await generateSuratPerizinan({
          id: existingSurat.id,
          nama: existingSurat.user.username || "Penghuni",
          fasilitas: existingSurat.fasilitas,
          keperluan: existingSurat.keperluan,
          tanggalMulai: existingSurat.tanggalMulai,
          tanggalSelesai: existingSurat.tanggalSelesai
        });

        // Update surat dengan URL file dari Supabase
        const surat = await prisma.surat.update({
          where: { id },
          data: { 
            status: "approved", 
            feedback: feedback || "Surat perizinan telah disetujui. Silakan unduh PDF surat Anda.",
            file: pdfResult.url
          },
        });

        return res.status(200).json({ 
          message: "Permohonan surat disetujui dan PDF berhasil dibuat", 
          data: surat 
        });
      } catch (error) {
        console.error("Error generating PDF:", error);
        return res.status(500).json({ 
          message: "Gagal membuat file PDF surat", 
          error: error.message 
        });
      }
    } else {
      // Update tanpa generate PDF
      const surat = await prisma.surat.update({
        where: { id },
        data: { 
          status, 
          feedback: feedback || (status === "rejected" ? "Permohonan surat ditolak" : "Status surat diperbarui")
        },
      });

      return res.status(200).json({ 
        message: "Status surat berhasil diperbarui", 
        data: surat 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// Detail surat
const getDetailSurat = async (req, res) => {
  try {
    const { id } = req.params;
    
    const surat = await prisma.surat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phone: true,
            cluster: true,
            nomor_rumah: true
          }
        }
      }
    });
    
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }
    
    res.status(200).json({ 
      message: "Success", 
      data: surat 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// Download surat
const downloadSurat = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ambil data surat
    const surat = await prisma.surat.findUnique({
      where: { id },
    });
    
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }
    
    if (surat.status !== 'approved') {
      return res.status(400).json({ message: "Surat belum disetujui" });
    }
    
    if (!surat.file) {
      return res.status(400).json({ message: "File surat tidak tersedia" });
    }
    
    // Download file
    const fileName = `surat_perizinan_${surat.id}.pdf`;

    // Jika menggunakan Supabase
    if (surat.file.startsWith('surat/')) {
      return await downloadFileFromStorage(req, res, surat.file, fileName);
    } else {
      // Fallback ke file lokal (jika masih ada)
      return res.status(400).json({ message: "Format path file tidak valid" });
    }
    
  } catch (error) {
    res.status(500).json({ 
      message: "Gagal mendownload surat", 
      error: error.message 
    });
  }
};

module.exports = { getSurat, updateSurat, getDetailSurat, downloadSurat };
  

