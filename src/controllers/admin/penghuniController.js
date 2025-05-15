const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dotenv = require("dotenv");
dotenv.config();
const {createClient} = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const getPenghuni = async (req, res) => {
    try {
        const penghuni = await prisma.penghuni.findMany({include: {user: true}});
        res.status(200).json({ success: true, data: penghuni });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getPenghuniById = async (req, res) => {
    try {
        const { id } = req.params;
        const penghuni = await prisma.penghuni.findUnique({ where: { id }, include: {user: true} });
        res.status(200).json({ success: true, data: penghuni });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } 
}


module.exports = { getPenghuni, getPenghuniById };