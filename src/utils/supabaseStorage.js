const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Koneksi ke Supabase
const supabaseUrl = process.env.SUPABASE_URL;
// Gunakan Service Role Key untuk akses administratif ke Storage
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validasi konfigurasi
if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY harus diatur di file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload file ke Supabase Storage
 * @param {Buffer} fileBuffer - Buffer file
 * @param {string} fileName - Nama file
 * @param {string} folderName - Folder penyimpanan (surat, broadcast, pengaduan)
 * @param {string} contentType - Tipe konten file (misalnya: 'application/pdf')
 * @returns {Promise<Object>} - Info file setelah diupload {path, url}
 */
const uploadFile = async (fileBuffer, fileName, folderName = 'surat', contentType = 'application/pdf') => {
  try {
    // Ambil semua bucket yang tersedia
    const { data: buckets } = await supabase.storage.listBuckets();
    
    // Default menggunakan bucket pertama yang ditemukan jika tidak ada yang ditentukan di env
    let bucketName = 'uploads';
    
    if (!bucketName && buckets.length > 0) {
      bucketName = buckets[0].name;
      console.log(`Menggunakan bucket default: ${bucketName}`);
    } else if (!bucketName) {
      throw new Error('Tidak ada bucket yang tersedia dan SUPABASE_STORAGE_BUCKET tidak diatur');
    }

    // Path file di storage
    const filePath = `${folderName}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true // Overwrite jika file sudah ada
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Mendapatkan URL publik
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 hari

    console.log('File berhasil diupload:', filePath);
    return {
      path: filePath,
      url: urlData?.signedUrl
    };
  } catch (error) {
    console.error('Error uploading to Supabase Storage:', error);
    throw error;
  }
};

/**
 * Download file dari Supabase Storage
 * @param {string} filePath - Path file di storage (misalnya: 'surat/file.pdf')
 * @returns {Promise<Buffer>} - Buffer file
 */
const downloadFile = async (filePath) => {
  try {
    // Cek apakah bucket ditentukan
    let bucketName = process.env.SUPABASE_STORAGE_BUCKET;
    
    if (!bucketName) {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (buckets.length > 0) {
        bucketName = buckets[0].name;
      } else {
        throw new Error('Tidak ada bucket yang tersedia');
      }
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      throw new Error(`Error downloading file: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error downloading from Supabase Storage:', error);
    throw error;
  }
};

/**
 * Mendapatkan signed URL dari file di storage
 * @param {string} filePath - Path file di storage (misalnya: 'surat/file.pdf')
 * @param {number} expiresIn - Waktu kedaluwarsa URL dalam detik
 * @returns {Promise<string>} - Signed URL
 */
const getSignedUrl = async (filePath, expiresIn = 60 * 60) => {
  try {
    // Cek apakah bucket ditentukan
    let bucketName = process.env.SUPABASE_STORAGE_BUCKET;
    
    if (!bucketName) {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (buckets.length > 0) {
        bucketName = buckets[0].name;
      } else {
        throw new Error('Tidak ada bucket yang tersedia');
      }
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Error getting signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};

module.exports = { supabase, uploadFile, downloadFile, getSignedUrl }; 