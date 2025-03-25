const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Get All Kendala
const kendala = async (req, res) => {
    try {
        const allUsers = await prisma.pengaduan.findMany({});
        res.status(200).json({ message: "Success", data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// Update Kendala (PUT) - Hanya Admin
const updateKendala = async (req, res) => {
    const { id } = req.params;
    const { status_kendala,feedback } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        console.log("ID yang diterima:", id);

        const updatedKendala = await prisma.pengaduan.update({
            where: { id: id },
            data: { 
                status_kendala: status_kendala , 
                feedback: feedback 
            },
        });

        const response = await supabase.channel("all_changes").send({
                type: "broadcast",
                event: "updated_kendala",
                payload: updatedKendala,
        });

        
        res.status(200).json({ success: true, data: updatedKendala });
    } catch (error) {
        console.error("Update error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



module.exports = {kendala, updateKendala}