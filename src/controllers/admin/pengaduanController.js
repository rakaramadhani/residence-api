const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get All Pengaduan
const pengaduan = async (req, res) => {
    try {
        const allUsers = await prisma.pengaduan.findMany({ include: { user: true } });
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// Update pengaduan (PUT) - Hanya Admin
const updatePengaduan = async (req, res) => {
    const { id } = req.params;
    const { status_pengaduan,feedback } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        console.log("ID yang diterima:", id);

        const updatedPengaduan = await prisma.pengaduan.update({
            where: { id: id },
            data: { 
                status_pengaduan: status_pengaduan , 
                feedback: feedback 
            },
        });

        const response = await supabase.channel("all_changes").send({
                type: "broadcast",
                event: "updated_pengaduan",
                payload: updatedPengaduan,
        });

        
        res.status(200).json({ success: true, data: updatedPengaduan });
    } catch (error) {
        console.error("Update error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Pengaduan by ID
const getPengaduanById = async (req, res) => {
    const { id } = req.params;
    try {
        const pengaduan = await prisma.pengaduan.findUnique({
            where: { id: id },
            include: { user: true }
        });
        res.status(200).json({ message: "Success", data: pengaduan });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


module.exports = {pengaduan, updatePengaduan, getPengaduanById}