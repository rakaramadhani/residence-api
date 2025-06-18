const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const QRCode = require('qrcode');
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
    // Generate QR Code untuk validasi surat terlebih dahulu
    // URL akan mengarah ke frontend Next.js yang berjalan di port 3000
    const validationUrl = `${'https://residence-admin.vercel.app/'}/validate-surat/${data.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(validationUrl, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convert base64 to buffer untuk QR code
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      // Nama file
      const fileName = `surat_perizinan_${data.id}.pdf`;
      
      // Buat PDF dokumen dengan margin yang lebih besar untuk tampilan formal
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 60, bottom: 60, left: 60, right: 60 }
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
      
      // === KOP SURAT (HEADER) ===
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      
      // Logo/Header utama
      doc.fontSize(18)
         .font('Times-Bold')
         .text('PENGELOLA RESIDENCE', { align: 'center' });
      
      doc.fontSize(16)
         .font('Times-Bold')
         .text('PERUMAHAN CHERRY FIELD', { align: 'center' });
      
      doc.fontSize(10)
         .font('Times-Roman')
         .text('Jl. Ciganitri, Desa Cipagalo, Kecamatan Bojongsoang,', { align: 'center' });
      
      doc.text('Kabupaten Bandung, Jawa Barat 40287', { align: 'center' });
      
      doc.text('Telp: (022) 1234-5678 | Email: info@cherryfield.com', { align: 'center' });
      
      // Garis pemisah header
      doc.moveDown(1);
      const currentY = doc.y;
      doc.moveTo(60, currentY)
         .lineTo(60 + pageWidth, currentY)
         .strokeColor('#000000')
         .lineWidth(2)
         .stroke();
      
      doc.moveDown(0.5);
      doc.moveTo(60, doc.y)
         .lineTo(60 + pageWidth, doc.y)
         .strokeColor('#000000')
         .lineWidth(0.5)
         .stroke();
      
      doc.moveDown(2);
      
      // === JUDUL SURAT ===
      doc.fontSize(14)
         .font('Times-Bold')
         .text('SURAT PERIZINAN PENGGUNAAN FASILITAS', { align: 'center' });
      
      // Nomor surat formal
      const currentDate = new Date();
      const nomorSurat = `${data.id.substring(0, 8).toUpperCase()}/PGF/${currentDate.getFullYear()}`;
      
      doc.moveDown(1);
      doc.fontSize(11)
         .font('Times-Roman')
         .text(`Nomor: ${nomorSurat}`, { align: 'center' });
      
      doc.moveDown(2);
      
      // === ISI SURAT ===
      doc.fontSize(11)
         .font('Times-Roman')
         .text('Yang bertanda tangan di bawah ini, Pengelola Kompleks Residence, dengan ini memberikan izin kepada:', { align: 'justify' });
      
      doc.moveDown(1.5);
      
      // === TABEL INFORMASI PEMOHON ===
      const tableStartY = doc.y;
      const leftMargin = 80;
      const colonPosition = 200;
      const valuePosition = 220;
      const rowHeight = 20;
      
      // Data untuk tabel
      const tableData = [
        ['Nama Lengkap', data.nama],
        ['Fasilitas yang Diminta', data.fasilitas],
        ['Keperluan Penggunaan', data.keperluan],
        ['Tanggal Penggunaan', formatTanggal(data.tanggalMulai)],
        ['Waktu Mulai', formatWaktu(data.tanggalMulai) + ' WIB'],
        ['Waktu Selesai', formatWaktu(data.tanggalSelesai) + ' WIB']
      ];
      
      // Gambar border tabel
      const tableHeight = tableData.length * rowHeight + 10;
      doc.rect(leftMargin - 10, tableStartY - 5, pageWidth - (leftMargin - 60) * 2 + 20, tableHeight)
         .strokeColor('#cccccc')
         .lineWidth(1)
         .stroke();
      
      let currentTableY = tableStartY;
      
      tableData.forEach((row, index) => {
        // Background alternating untuk setiap baris
        if (index % 2 === 0) {
          doc.rect(leftMargin - 10, currentTableY - 2, pageWidth - (leftMargin - 60) * 2 + 20, rowHeight)
             .fillColor('#f8f8f8')
             .fill();
        }
        
        // Label
        doc.fillColor('#000000')
           .fontSize(10)
           .font('Times-Roman')
           .text(row[0], leftMargin, currentTableY, { continued: false });
        
        // Titik dua
        doc.text(':', colonPosition, currentTableY);
        
        // Nilai
        doc.font('Times-Bold')
           .text(row[1], valuePosition, currentTableY, { 
             width: pageWidth - (valuePosition - 60) - 20,
             align: 'left'
           });
        
        currentTableY += rowHeight;
      });
      
      doc.y = tableStartY + tableHeight + 20;
      
      // === KETENTUAN DAN SYARAT ===
      // Gunakan margin yang sama dengan tabel untuk konsistensi
      doc.fontSize(11)
         .font('Times-Roman')
         .text('Untuk menggunakan fasilitas tersebut dengan ketentuan sebagai berikut:', 
               leftMargin - 20, doc.y, { 
                 align: 'left',
                 width: pageWidth - (leftMargin - 20) * 2
               });
      
      doc.moveDown(1);
      
      const syaratList = [
        'Pengguna wajib mematuhi semua peraturan yang berlaku di kompleks residence.',
        'Pengguna bertanggung jawab penuh atas kerusakan yang terjadi pada fasilitas.',
        'Pengguna wajib menjaga kebersihan dan ketertiban selama penggunaan fasilitas.',
        'Surat izin ini tidak dapat dipindahtangankan kepada pihak lain.',
        'Pengelola berhak membatalkan izin jika terjadi pelanggaran ketentuan.'
      ];
      
      syaratList.forEach((syarat, index) => {
        doc.fontSize(10)
           .font('Times-Roman')
           .text(`${index + 1}. ${syarat}`, 
                  leftMargin - 20, doc.y, {
                    align: 'left',
                    width: pageWidth - (leftMargin - 20) * 2,
                    lineGap: 2
                  });
        doc.moveDown(0.5);
      });
      
      doc.moveDown(1);
      
      // === PENUTUP ===
      doc.fontSize(11)
         .font('Times-Roman')
         .text('Demikian surat izin ini dibuat untuk dapat dipergunakan sebagaimana mestinya.', 
               leftMargin - 20, doc.y, { 
                 align: 'left',
                 width: pageWidth - (leftMargin - 20) * 2 
               });

      doc.moveDown(0.5);
      
      // === TANDA TANGAN ===
      // === TANDA TANGAN DAN QR CODE ===
const today = new Date();
doc.moveDown(2);

// Tempat dan tanggal
doc.fontSize(11)
   .font('Times-Roman')
   .text(`Bandung, ${formatTanggal(today)}`, { align: 'right' });

doc.moveDown(1);
doc.font('Times-Bold')
   .text('PENGELOLA PERUMAHAN', { align: 'right' })
   .text('CHERRY FIELD', { align: 'right' });

doc.moveDown(1);

// === QR CODE DI BAWAH TULISAN TANDA TANGAN ===
const qrCodeSize = 70;
// Posisikan QR code di sebelah kanan, sejajar dengan tulisan tanda tangan
const qrCodeX = doc.page.width - doc.page.margins.right - qrCodeSize;
const qrCodeY = doc.y;

doc.image(qrCodeBuffer, qrCodeX, qrCodeY, {
  width: qrCodeSize,
  height: qrCodeSize
});

// Pindahkan posisi Y ke bawah QR code untuk melanjutkan konten
doc.y = Math.max(doc.y, qrCodeY + qrCodeSize + 20);

// === FOOTER ===
const footerY = doc.y;
doc.moveTo(60, footerY)
   .lineTo(60 + pageWidth, footerY)
   .strokeColor('#cccccc')
   .lineWidth(0.5)
   .stroke();

doc.moveDown(0.5);
doc.fontSize(8)
   .font('Times-Roman')
   .fillColor('#666666')
   .text('Surat ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah.', 
         60, doc.y, { 
           align: 'center',
           width: pageWidth
         });
doc.text(`Diterbitkan pada: ${formatTanggal(today)} ${formatWaktu(today)} WIB`, 
         60, doc.y, { 
           align: 'center',
           width: pageWidth
         });
doc.text(`ID Validasi: ${data.id}`, 
         60, doc.y, { 
           align: 'center',
           width: pageWidth
         });

      // Finalisasi dokumen
      doc.end();
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

module.exports = { generateSuratPerizinan }; 