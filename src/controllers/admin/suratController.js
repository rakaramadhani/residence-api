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

        // Update surat dengan PATH file dari Supabase (bukan URL)
        const surat = await prisma.surat.update({
          where: { id },
          data: { 
            status: "approved", 
            feedback: feedback || "Surat perizinan telah disetujui. Silakan unduh PDF surat Anda.",
            file: pdfResult.path
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
    console.log(`Download request for surat ID: ${id}`);
    
    // Ambil data surat
    const surat = await prisma.surat.findUnique({
      where: { id },
    });
    
    if (!surat) {
      console.log(`Surat tidak ditemukan untuk ID: ${id}`);
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }
    
    console.log(`Surat ditemukan: status=${surat.status}, file=${surat.file}`);
    
    if (surat.status !== 'approved') {
      return res.status(400).json({ message: "Surat belum disetujui" });
    }
    
    if (!surat.file) {
      return res.status(400).json({ message: "File surat tidak tersedia" });
    }
    
    // Download file
    const fileName = `surat_perizinan_${surat.id}.pdf`;

    try {
      // Jika file tersimpan sebagai URL (legacy data)
      if (surat.file.startsWith('http')) {
        console.log('File stored as signed URL, extracting path...');
        
        // Extract path dari signed URL
        // URL format: https://...supabase.co/storage/v1/object/sign/uploads/surat/filename.pdf?token=...
        const urlObj = new URL(surat.file);
        const pathParts = urlObj.pathname.split('/');
        const signIndex = pathParts.indexOf('sign');
        
        console.log(`URL pathname: ${urlObj.pathname}`);
        console.log(`Path parts: ${JSON.stringify(pathParts)}`);
        console.log(`Sign index: ${signIndex}`);
        
        if (signIndex !== -1 && signIndex + 1 < pathParts.length) {
          // Ambil path setelah "/sign/"
          const fullPath = pathParts.slice(signIndex + 1).join('/');
          console.log(`Full extracted path: ${fullPath}`);
          
          // Remove bucket name dari path jika ada
          // Format: uploads/surat/filename.pdf -> surat/filename.pdf
          let filePath = fullPath;
          if (fullPath.startsWith('uploads/')) {
            filePath = fullPath.substring('uploads/'.length);
          }
          
          console.log(`Final file path (without bucket): ${filePath}`);
          
          // Coba download menggunakan path yang di-extract
          try {
            console.log(`Attempting download with extracted path: ${filePath}`);
            return await downloadFileFromStorage(req, res, filePath, fileName);
          } catch (extractError) {
            console.error('Error downloading with extracted path:', extractError);
            console.error('Error details:', JSON.stringify(extractError, null, 2));
            throw extractError;
          }
        } else {
          // Jika tidak bisa extract path, redirect ke URL signed (fallback)
          console.log('Cannot extract path, redirecting to signed URL');
          return res.redirect(surat.file);
        }
      }
      
      // Jika file tersimpan sebagai path (format baru)
      console.log(`File stored as path: ${surat.file}`);
      console.log(`Attempting to download file from Supabase storage: ${surat.file}`);
      return await downloadFileFromStorage(req, res, surat.file, fileName);
      
    } catch (storageError) {
      console.error('Error downloading from storage:', storageError);
      console.error('Storage error details:', JSON.stringify(storageError, null, 2));
      
      // Jika original file adalah URL dan download dari path gagal, coba redirect
      if (surat.file.startsWith('http')) {
        console.log('Storage download failed, trying redirect to original signed URL');
        return res.redirect(surat.file);
      }
      
      return res.status(500).json({ 
        message: "Gagal mendownload file", 
        error: storageError.message,
        debug: {
          fileField: surat.file,
          expectedFormat: "surat/filename.pdf atau https://...",
          errorType: storageError.constructor.name
        }
      });
    }
    
  } catch (error) {
    console.error('Download surat error:', error);
    res.status(500).json({ 
      message: "Gagal mendownload surat", 
      error: error.message 
    });
  }
};

// Debug surat - untuk troubleshooting
const debugSurat = async (req, res) => {
  try {
    const { id } = req.params;
    
    const surat = await prisma.surat.findUnique({
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
    
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }
    
    // Check file type and format
    let fileInfo = {
      exists: !!surat.file,
      value: surat.file,
      type: 'unknown'
    };
    
    if (surat.file) {
      if (surat.file.startsWith('http')) {
        fileInfo.type = 'url';
      } else if (surat.file.startsWith('surat/')) {
        fileInfo.type = 'supabase_path';
      } else {
        fileInfo.type = 'other';
      }
    }
    
    res.status(200).json({
      message: "Debug info surat",
      data: {
        id: surat.id,
        status: surat.status,
        fasilitas: surat.fasilitas,
        keperluan: surat.keperluan,
        tanggalMulai: surat.tanggalMulai,
        tanggalSelesai: surat.tanggalSelesai,
        user: surat.user,
        fileInfo,
        canDownload: surat.status === 'approved' && !!surat.file
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};

// Test endpoint untuk cek environment variables dan koneksi Supabase
const testSupabaseConnection = async (req, res) => {
  try {
    const { supabase } = require('../../utils/supabaseStorage');
    
    // Cek environment variables
    const envCheck = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SUPABASE_SERVICE_ROLE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      SUPABASE_SERVICE_ROLE_KEY_STARTS: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'null',
    };
    
    // Test koneksi Supabase
    let supabaseTest = {};
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      if (error) {
        supabaseTest = { error: error.message, buckets: null };
      } else {
        supabaseTest = { error: null, buckets: buckets.map(b => b.name) };
      }
    } catch (supabaseError) {
      supabaseTest = { error: supabaseError.message, buckets: null };
    }
    
    res.status(200).json({
      message: "Test Supabase Connection",
      envCheck,
      supabaseTest
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Test gagal", 
      error: error.message 
    });
  }
};

module.exports = { getSurat, updateSurat, getDetailSurat, downloadSurat, debugSurat, testSupabaseConnection };
  

