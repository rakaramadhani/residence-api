const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { downloadFileFromStorage, getSignedUrl } = require('../../utils/fileHandler');

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

module.exports = { getSurat, createSurat, deleteSurat, downloadSurat, getUrlSurat };
    
    
