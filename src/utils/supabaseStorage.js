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

// Fungsi helper untuk mendapatkan bucket name
const getBucketName = async () => {
  try {
    // Prioritas: Environment variable, lalu default 'uploads'
    let bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';
    
    // Verifikasi bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists && buckets.length > 0) {
      bucketName = buckets[0].name;
      console.log(`Bucket '${process.env.SUPABASE_STORAGE_BUCKET || 'uploads'}' tidak ditemukan. Menggunakan: ${bucketName}`);
    }
    
    return bucketName;
  } catch (error) {
    console.error('Error getting bucket name:', error);
    throw error;
  }
};

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
    const bucketName = await getBucketName();
    console.log(`Uploading file to bucket: ${bucketName}`);

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
    const bucketName = await getBucketName();
    console.log(`Downloading file from bucket: ${bucketName}, path: ${filePath}`);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Supabase download error:', error);
      throw new Error(`Error downloading file: ${error.message}`);
    }

    if (!data) {
      throw new Error('File data is null or undefined');
    }

    // Konversi Blob menjadi Buffer
    console.log('File downloaded successfully, converting Blob to Buffer...');
    console.log('Blob size:', data.size, 'bytes');
    
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('Buffer size:', buffer.length, 'bytes');
    
    return buffer;
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
    const bucketName = await getBucketName();
    console.log(`Getting signed URL from bucket: ${bucketName}, path: ${filePath}`);

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