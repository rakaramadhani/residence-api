const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

// Pastikan env terbaca
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const prisma = new PrismaClient();

const getPeraturan = async (req, res) => {
    try {
        const allPeraturan = await prisma.peraturan.findMany({});
        res.status(200).json({ success: true, data: allPeraturan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {getPeraturan};
    
