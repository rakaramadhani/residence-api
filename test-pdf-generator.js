const { generateSuratPerizinan } = require('./src/utils/pdfGenerator');
const fs = require('fs');
const path = require('path');

// Data dummy untuk testing
const dummyData = {
  id: 'test-surat-12345',
  nama: 'Ahmad Budi Santoso',
  fasilitas: 'Aula Serbaguna',
  keperluan: 'Acara Pernikahan Keluarga',
  tanggalMulai: new Date('2024-12-25T09:00:00'),
  tanggalSelesai: new Date('2024-12-25T22:00:00'),
  deskripsi: 'Acara pernikahan anak dengan tamu undangan sekitar 100 orang'
};

async function testPDFGeneration() {
  try {
    console.log('🔄 Generating PDF dengan data dummy...');
    console.log('Data yang digunakan:', JSON.stringify(dummyData, null, 2));
    
    const result = await generateSuratPerizinan(dummyData);
    
    console.log('✅ PDF berhasil dibuat!');
    console.log('📁 File path:', result.path);
    console.log('🔗 File URL:', result.url);
    
    // Jika running locally, bisa download file untuk preview
    if (result.url && result.url.startsWith('http')) {
      console.log('\n📋 Cara preview:');
      console.log('1. Buka URL di browser:', result.url);
      console.log('2. Atau scan QR code di PDF untuk test validasi');
      console.log('3. QR code akan mengarah ke: http://localhost:3001/validate-surat/' + dummyData.id);
    }
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    console.error(error.stack);
  }
}

// Jalankan test
testPDFGeneration(); 