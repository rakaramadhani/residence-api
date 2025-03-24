const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

// Pastikan env terbaca
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const prisma = new PrismaClient();


// Get Kendala tiap User
const getKendala = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.kendala.findMany({
            where: { userId: user_id }
        });
        if (!data.length) {
            return res.status(200).json({ message: "No data found" });
        }
        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Buat Kendala
const createKendala = async (req, res) => {
    const { user_id } = req.params;
    const { kendala, kategori } = req.body;
    try {
        // Simpan data ke database
        const newKendala = await prisma.kendala.create({
        data: {
            userId : user_id,
            kendala,
            kategori,
        },
        });

        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "new_kendala",
            payload: newKendala,
        });

        console.log("Supabase Event Sent:", response);


        res.status(200).json({ success: true, data: newKendala });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateKendala = async (req, res) => {
    const { id , user_id } = req.params;
    const { kendala , kategori } = req.body;

    try {
        const updatedKendala = await prisma.kendala.update({
            where: { id: id ,userId: user_id },
            data: { kendala, kategori },
        });

        // Kirim event realtime ke Supabase
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "updated_kendala",
            payload: updatedKendala,
        });

        console.log("Supabase Event Sent:", response);

        res.status(200).json({ success: true, data: updatedKendala });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteKendala = async (req, res) => {
    try {
        const { user_id, id } = req.params;
        const deleted = await prisma.kendala.delete({
            where: {  userId: user_id, id: id, }
        });
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "deleted",
            payload: deleted,
        });

        console.log("Supabase Event Sent:", response);
        res.status(200).json({ message: "Success" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {getKendala, createKendala, updateKendala, deleteKendala};