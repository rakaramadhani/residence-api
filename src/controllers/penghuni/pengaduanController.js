const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

// Pastikan env terbaca
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const prisma = new PrismaClient();


// Get Pengaduan tiap User
const getPengaduan = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.pengaduan.findMany({
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

// Buat Pengaduan
const createPengaduan = async (req, res) => {
    const { user_id } = req.params;
    const { pengaduan, kategori } = req.body;
    try {
        // Simpan data ke database
        const newPengaduan = await prisma.pengaduan.create({
        data: {
            userId : user_id,
            pengaduan,
            kategori,
        },
        });

        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "new_pengaduan",
            payload: newPengaduan,
        });

        console.log("Supabase Event Sent:", response);


        res.status(200).json({ success: true, data: newPengaduan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updatePengaduan = async (req, res) => {
    const { id , user_id } = req.params;
    const { pengaduan , kategori } = req.body;

    try {
        const updatedPengaduan= await prisma.pengaduan.update({
            where: { id: id ,userId: user_id },
            data: { pengaduan, kategori },
        });

        // Kirim event realtime ke Supabase
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "updated_Pengaduan",
            payload: updatedPengaduan,
        });

        console.log("Supabase Event Sent:", response);

        res.status(200).json({ success: true, data: updatedPengaduan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deletePengaduan = async (req, res) => {
    try {
        const { user_id, id } = req.params;
        const deleted = await prisma.pengaduan.delete({
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

module.exports = {getPengaduan, createPengaduan, updatePengaduan, deletePengaduan};