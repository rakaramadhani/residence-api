const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Koneksi ke Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validasi konfigurasi
if (!supabaseUrl || !supabaseKey) {
  console.error('SUPABASE_URL dan SUPABASE_ANON_KEY harus diatur di file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };