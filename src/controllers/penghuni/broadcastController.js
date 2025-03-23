const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

// Pastikan env terbaca
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const prisma = new PrismaClient();


// get all broadcast
const getAllBroadcast = async (req, res) => {
    try{
        const allBroadcast = await prisma.broadcast.findMany({});
        res.status(200).json({message:"success", data: allBroadcast});
    }catch(error){
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Get broadcast tiap User
const getBroadcast = async (req, res) => {
    try {
        const { user_id } = req.params;
        const data = await prisma.broadcast.findMany({
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

// Buat Broadcast
const createBroadcast = async (req, res) => {
    const { user_id } = req.params;
    const { broadcast, tanggal_acara} = req.body;
    try {
        // Simpan data ke database
        const newBroadcast = await prisma.broadcast.create({
        data :{ userId: user_id, broadcast, tanggal_acara }
        });

        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "new_broadcast",
            payload: newBroadcast,
        });

        console.log("Supabase Event Sent:", response);


        res.status(201).json({ success: true, data: newBroadcast });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBroadcast = async (req, res) => {
    const { id , user_id } = req.params;
    const { broadcast, tanggal_acara } = req.body;

    try {
        const updatedBroacast = await prisma.broadcast.update({
            where: { id: id , userId: user_id },
            data: { broadcast, tanggal_acara },
        });

        // Kirim event realtime ke Supabase
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "updated_broadcast",
            payload: updatedBroacast,
        });

        console.log("Supabase Event Sent:", response);

        res.status(200).json({ success: true, data: updatedBroacast });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBroadcast = async (req, res) => {
    try {
        const { user_id, broadcast_id } = req.params;
        const deleted = await prisma.broadcast.delete({
            where: { id: broadcast_id, userId: user_id }
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

module.exports = {getAllBroadcast,getBroadcast,createBroadcast,updateBroadcast,deleteBroadcast};