const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { downloadFileFromStorage, getSignedUrl } = require('../../utils/fileHandler');

const getSurat = async (req, res) => {
    try {
        const { user_id } = req.params;
        const surat = await prisma.surat.findMany({
            where: { userId: user_id }, orderBy: { createdAt: 'desc' },
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
        const { fasilitas, keperluan, tanggalMulai, tanggalSelesai, deskripsi } = req.body;

        // Validasi input
        if (!fasilitas || !keperluan || !tanggalMulai || !tanggalSelesai) {
            return res.status(400).json({
                message: "Fasilitas, keperluan, tanggal mulai, dan tanggal selesai wajib diisi"
            });
        }

        // Validasi tanggal
        const dateStart = new Date(tanggalMulai);
        const dateEnd = new Date(tanggalSelesai);

        if (isNaN(dateStart.getTime()) || isNaN(dateEnd.getTime())) {
            return res.status(400).json({
                message: "Format tanggal tidak valid"
            });
        }
        
        if (dateStart > dateEnd) {
            return res.status(400).json({
                message: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai"
            });
        }

        // Ambil user
        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Buat surat
        const surat = await prisma.surat.create({
            data: {
                userId: user.id,
                fasilitas,
                keperluan,
                tanggalMulai: dateStart,
                tanggalSelesai: dateEnd,
                deskripsi,
                status: 'requested',
            },
        });

        res.status(201).json({ 
            message: "Permohonan surat perizinan berhasil dibuat", 
            data: surat 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message 
        });
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
        
        // Redirect ke URL Supabase yang tersimpan
        return res.redirect(surat.file);
        
    } catch (error) {
        res.status(500).json({ 
            message: "Gagal mendownload surat", 
            error: error.message 
        });
    }
};

// Endpoint untuk mendapatkan direct URL ke file (opsional, jika dibutuhkan)
const getUrlSurat = async (req, res) => {
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
        
        // Kembalikan URL yang sudah tersimpan
        return res.status(200).json({
            message: "URL surat berhasil didapatkan",
            url: surat.file
        });
        
    } catch (error) {
        res.status(500).json({ 
            message: "Gagal mendapatkan URL surat", 
            error: error.message 
        });
    }
};

// API endpoint untuk validasi surat (mengembalikan JSON)
const validateSurat = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Ambil data surat beserta user dan penghuni
        const surat = await prisma.surat.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        cluster: true,
                        nomor_rumah: true,
                        penghuni: {
                            select: {
                                nama: true,
                                nik: true
                            }
                        }
                    }
                }
            }
        });
        
        if (!surat) {
            return res.status(404).json({
                success: false,
                message: "Surat tidak ditemukan",
                data: null
            });
        }
        
        console.log('Debug - Surat data:', JSON.stringify(surat, null, 2)); // Debug log
        
        // Ambil data penghuni pertama sebagai pemohon (asumsi penghuni pertama adalah kepala keluarga)
        const pemohon = surat.user.penghuni && surat.user.penghuni.length > 0 ? surat.user.penghuni[0] : null;
        
        // Jika tidak ada data penghuni, gunakan data fallback dari user
        let nama, nik;
        if (pemohon) {
            nama = pemohon.nama;
            nik = pemohon.nik;
        } else {
            // Fallback: gunakan data dari user atau placeholder
            nama = surat.user.username || surat.user.email || 'Penghuni Tidak Diketahui';
            nik = 'Data NIK tidak tersedia';
            console.log('Warning: Menggunakan data fallback karena data penghuni tidak ada');
        }

        // Return data surat dalam format JSON
        return res.status(200).json({
            success: true,
            message: "Data surat berhasil ditemukan",
            data: {
                id: surat.id,
                nama: nama,
                nik: nik,
                alamat: `${surat.user.cluster || 'Unknown'} No. ${surat.user.nomor_rumah || 'Unknown'}`,
                fasilitas: surat.fasilitas,
                keperluan: surat.keperluan,
                tanggalMulai: surat.tanggalMulai,
                tanggalSelesai: surat.tanggalSelesai,
                status: surat.status,
                createdAt: surat.createdAt,
                updatedAt: surat.updatedAt,
                deskripsi: surat.deskripsi
            }
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan dalam memvalidasi surat",
            error: error.message
        });
    }
};

// Endpoint untuk preview PDF dengan data dummy (untuk testing)
const previewSuratPDF = async (req, res) => {
    try {
        // Data dummy untuk preview
        const dummyData = {
            id: 'preview-' + Date.now(),
            nama: req.query.nama || 'Ahmad Budi Santoso',
            fasilitas: req.query.fasilitas || 'Aula Serbaguna',
            keperluan: req.query.keperluan || 'Acara Pernikahan Keluarga',
            tanggalMulai: new Date(req.query.tanggalMulai || '2024-12-25T09:00:00'),
            tanggalSelesai: new Date(req.query.tanggalSelesai || '2024-12-25T22:00:00'),
            deskripsi: req.query.deskripsi || 'Preview surat untuk testing tampilan PDF'
        };

        console.log('🔄 Generating preview PDF dengan data:', dummyData);

        // Import PDF generator
        const { generateSuratPerizinan } = require('../../utils/pdfGenerator');
        
        // Generate PDF
        const result = await generateSuratPerizinan(dummyData);
        
        // Return URL untuk preview
        return res.status(200).json({
            success: true,
            message: "Preview PDF berhasil dibuat",
            data: {
                pdfUrl: result.url,
                qrValidationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/validate-surat/${dummyData.id}`,
                dummyData: dummyData
            }
        });
        
    } catch (error) {
        console.error('Error generating preview PDF:', error);
        return res.status(500).json({
            success: false,
            message: "Gagal membuat preview PDF",
            error: error.message
        });
    }
};

module.exports = { getSurat, createSurat, deleteSurat, downloadSurat, getUrlSurat, validateSurat, previewSuratPDF };
    
    
