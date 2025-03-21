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
            return res.status(404).json({ message: "No data found" });
        }
        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Buat Kendala
const createKendala = async (req, res) => {
    const { userId, kendala, kategori } = req.body;
    try {
        // Simpan data ke database
        const newKendala = await prisma.kendala.create({
        data: {
            userId,
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


        res.status(201).json({ success: true, data: newKendala });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateKendala = async (req, res) => {
    const { id } = req.params;
    const { status_kendala } = req.body;

    try {
        const updatedKendala = await prisma.kendala.update({
            where: { id: parseInt(id) },
            data: { status_kendala },
        });

        // Kirim event realtime ke Supabase
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "updated_kendala",
            payload: updateKendala,
        });

        console.log("Supabase Event Sent:", response);

        res.status(200).json({ success: true, data: updatedKendala });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteKendala = async (req, res) => {
    try {
        const { user_id, kendala_id } = req.params;
        const deleted = await prisma.kendala.delete({
            where: { id: kendala_id, userId: user_id }
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