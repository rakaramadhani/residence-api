const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { uploadFile } = require('./supabaseStorage');

// Buat direktori jika belum ada
const ensureDirectoryExists = async (directory) => {
  try {
    await fs.ensureDir(directory);
  } catch (error) {
    console.error('Gagal membuat direktori:', error);
    throw error;
  }
};

// Fungsi untuk format tanggal Indonesia
const formatTanggal = (date) => {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('id-ID', options);
};

// Fungsi untuk format waktu
const formatWaktu = (date) => {
  return new Date(date).toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Generate PDF surat perizinan fasilitas
 * @param {Object} data - Data surat
 * @param {string} data.id - ID surat
 * @param {string} data.nama - Nama pemohon
 * @param {string} data.fasilitas - Nama fasilitas yang digunakan
 * @param {string} data.keperluan - Keperluan penggunaan
 * @param {Date} data.tanggalMulai - Tanggal dan waktu mulai penggunaan
 * @param {Date} data.tanggalSelesai - Tanggal dan waktu selesai penggunaan
 * @returns {Promise<Object>} - Path dan URL file PDF
 */
const generateSuratPerizinan = async (data) => {
  try {
    return new Promise((resolve, reject) => {
      // Nama file
      const fileName = `surat_perizinan_${data.id}.pdf`;
      
      // Buat PDF dokumen
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      
      // Buffer untuk menyimpan PDF
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(chunks);
        
        try {
          // Upload ke Supabase
          const result = await uploadFile(
            pdfBuffer, 
            fileName, 
            'surat',
            'application/pdf'
          );
          
          // Path lengkap di storage Supabase
          resolve({
            path: result.path,
            url: result.url
          });
        } catch (error) {
          reject(error);
        }
      });
      
      // Kop surat
      doc.fontSize(16).font('Helvetica-Bold').text('SURAT PERIZINAN PENGGUNAAN FASILITAS', { align: 'center' });
      doc.fontSize(14).font('Helvetica-Bold').text('RESIDENCE APP', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).font('Helvetica').text('Nomor: ' + data.id, { align: 'center' });
      doc.moveDown(2);
      
      // Isi surat
      doc.fontSize(12).font('Helvetica');
      doc.text('Yang bertanda tangan di bawah ini menyetujui:');
      doc.moveDown();
      
      // Tabel informasi
      const tableData = [
        ['Nama', ': ' + data.nama],
        ['Fasilitas', ': ' + data.fasilitas],
        ['Keperluan', ': ' + data.keperluan],
        ['Tanggal Penggunaan', ': ' + formatTanggal(data.tanggalMulai)],
        ['Waktu Mulai', ': ' + formatWaktu(data.tanggalMulai)],
        ['Waktu Selesai', ': ' + formatWaktu(data.tanggalSelesai)]
      ];
      
      let y = doc.y;
      tableData.forEach(row => {
        doc.text(row[0], 50, y, { continued: false });
        doc.text(row[1], 150, y);
        y += 25;
      });
      
      doc.moveDown(2);
      doc.text('Untuk menggunakan fasilitas tersebut sesuai dengan keperluan yang telah disebutkan di atas.', { align: 'justify' });
      doc.moveDown();
      doc.text('Pihak pengguna fasilitas wajib mematuhi peraturan yang berlaku dan bertanggung jawab atas fasilitas yang digunakan.', { align: 'justify' });
      
      doc.moveDown(2);
      
      // Tanda tangan
      const today = new Date();
      doc.text(`Jakarta, ${formatTanggal(today)}`, { align: 'right' });
      doc.moveDown(4);
      doc.text('Pengelola Residence', { align: 'right' });
      
      // Finalisasi dokumen
      doc.end();
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

module.exports = { generateSuratPerizinan }; 