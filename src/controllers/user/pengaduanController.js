const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");



const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
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
        let fotoUrl = null;

        
        if (req.file) {
            const fileExt = req.file.originalname.split(".").pop();
            const fileName = `pengaduan_${Date.now()}.${fileExt}`;
            const filePath = `pengaduan/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("uploads") // nama bucket (buat "uploads" di Supabase Storage)
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (uploadError) throw uploadError;

            // ✅ Ambil public URL
            const { data: { publicUrl } } = supabase
                .storage
                .from("uploads")
                .getPublicUrl(filePath);

            fotoUrl = publicUrl;
        }

        // ✅ Simpan ke database
        const newPengaduan = await prisma.pengaduan.create({
            data: {
                userId: user_id,
                pengaduan,
                kategori,
                foto: fotoUrl,
            },
        });

        // Optional: kirim event
        await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "new_pengaduan",
            payload: newPengaduan,
        });

        res.status(200).json({ success: true, data: newPengaduan });

    } catch (error) {
        console.error("Create Pengaduan Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


const updatePengaduan = async (req, res) => {
    const { id, user_id } = req.params;  // id pengaduan dan user_id
    const { pengaduan, kategori } = req.body;  // data pengaduan dan kategori
    let fotoUrl = null;  // Variabel untuk menyimpan URL foto baru

    try {
        // Periksa apakah ada foto baru yang di-upload
        if (req.file) {
            const fileExt = req.file.originalname.split(".").pop();
            const fileName = `pengaduan_${Date.now()}.${fileExt}`;
            const filePath = `pengaduan/${fileName}`;

            // Upload foto ke Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("uploads")  // nama bucket (uploads)
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                });

            if (uploadError) throw uploadError;

            // Ambil public URL dari foto yang di-upload
            const { data: { publicUrl } } = supabase
                .storage
                .from("uploads")
                .getPublicUrl(filePath);

            fotoUrl = publicUrl;  // Set URL foto baru
        }

        // Update pengaduan di database (gunakan foto baru jika ada)
        const updatedPengaduan = await prisma.pengaduan.update({
            where: { id: id, userId: user_id },
            data: {
                pengaduan,    // Update pengaduan
                kategori,     // Update kategori
                foto: fotoUrl ? fotoUrl : undefined,  // Ganti foto jika ada foto baru, atau tetap menggunakan foto lama jika tidak ada foto baru
            },
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
        console.error("Update Pengaduan Error:", error.message);
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