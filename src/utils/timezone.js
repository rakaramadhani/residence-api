// Utility functions untuk handling timezone Indonesia (WIB/UTC+7)

/**
 * Mendapatkan tanggal dan waktu saat ini dalam timezone Indonesia (WIB/UTC+7)
 * @returns {Date} Date object dengan waktu Indonesia
 */
const getJakartaDate = () => {
  const now = new Date();
  // Tambahkan 7 jam untuk konversi dari UTC ke WIB
  const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  return jakartaTime;
};

/**
 * Mendapatkan ISO string dari waktu Indonesia saat ini
 * @returns {string} ISO string dengan waktu Indonesia
 */
const getJakartaISO = () => {
  return getJakartaDate().toISOString();
};

/**
 * Mengkonversi Date object ke waktu Indonesia
 * @param {Date} date - Date object yang akan dikonversi
 * @returns {Date} Date object dengan waktu Indonesia
 */
const convertToJakartaTime = (date) => {
  const utcTime = new Date(date);
  const jakartaTime = new Date(utcTime.getTime() + (7 * 60 * 60 * 1000));
  return jakartaTime;
};

/**
 * Mendapatkan timestamp untuk database dengan format yang konsisten
 * @returns {Date} Date object untuk disimpan di database
 */
const getDatabaseTimestamp = () => {
  // Untuk database, kita simpan sebagai UTC, tapi berdasarkan waktu Jakarta
  return getJakartaDate();
};

module.exports = {
  getJakartaDate,
  getJakartaISO,
  convertToJakartaTime,
  getDatabaseTimestamp
}; 