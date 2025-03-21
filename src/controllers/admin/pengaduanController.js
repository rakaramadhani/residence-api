const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get All Kendala
const kendala = async (req, res) => {
    try {
        const allUsers = await prisma.kendala.findMany({});
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const allUsers = await prisma.kendala.update({
            
        });
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Update Kendala (PUT) - Hanya Admin
const updateKendala = async (req, res) => {
    const { id } = req.params; // Ambil ID dari parameter URL
    const { status_kendala } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        console.log("ID yang diterima:", id); // Debugging

        const updatedKendala = await prisma.kendala.update({
            where: { id: id }, // Jika UUID, gunakan langsung
            data: { status_kendala },
        });

        res.status(200).json({ success: true, data: updatedKendala });
    } catch (error) {
        console.error("Update error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = {kendala, updateKendala}