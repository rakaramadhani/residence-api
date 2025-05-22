const path = require('path');
const fs = require('fs-extra');
const { downloadFile: downloadFromStorage, getSignedUrl } = require('./supabaseStorage');

/**
 * Menangani download file dari Supabase Storage
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {String} storagePath - Path file di storage
 * @param {String} fileName - Nama file untuk download
 */
const downloadFileFromStorage = async (req, res, storagePath, fileName) => {
  try {
    // Download dari storage
    const fileBuffer = await downloadFromStorage(storagePath);
    
    // Set header untuk download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Kirim buffer ke response
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error download file dari storage:', error);
    return res.status(500).json({ message: 'Gagal download file', error: error.message });
  }
};

/**
 * Generate signed URL untuk akses langsung ke file
 * @param {String} storagePath - Path file di storage 
 * @param {Number} expiresIn - Waktu kedaluwarsa URL dalam detik
 * @returns {Promise<String>} - Signed URL
 */
const getFileUrl = async (storagePath, expiresIn = 60 * 60) => {
  return await getSignedUrl(storagePath, expiresIn);
};

/**
 * Menangani download file dari local storage (legacy/fallback)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {String} filePath - Path file relatif dari root
 * @param {String} fileName - Nama file untuk download
 */
const downloadFile = (req, res, filePath, fileName) => {
  try {
    // Ubah path relatif ke absolute path
    const absolutePath = path.join(__dirname, '../../', filePath);
    
    // Cek apakah file ada
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'File tidak ditemukan' });
    }

    // Set header untuk download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    
    // Stream file ke response
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error download file:', error);
    return res.status(500).json({ message: 'Gagal download file', error: error.message });
  }
};

module.exports = { downloadFile, downloadFileFromStorage, getFileUrl }; 