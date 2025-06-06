const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dotenv = require("dotenv");
dotenv.config();
const {createClient} = require('@supabase/supabase-js')
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const { sendNotification } = require("./notificationController");

const createPeraturan = async (req, res) => {
    try {
        const { judul, kategori, isi_peraturan } = req.body;
        const peraturan = await prisma.peraturan.create({
                data: { judul, kategori, isi_peraturan },
        });
        
        // Broadcast ke Supabase
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "peraturan_created",
            payload: peraturan,
        });

        // Ambil semua user untuk notifikasi
        const allUsers = await prisma.user.findMany({
            select: { id: true }
        });
        const userIds = allUsers.map(user => user.id);

        // Kirim notifikasi ke semua user
        if (userIds.length > 0) {
            await sendNotification(
                {
                    body: {
                        userId: userIds,
                        judul: "Peraturan Baru",
                        isi: `Peraturan baru "${judul}" telah ditambahkan dalam kategori ${kategori}. Silakan cek aplikasi untuk detail lebih lanjut.`,
                        tipe: "Pemberitahuan"
                    }
                },
                {
                    status: (code) => ({
                        json: (data) => {
                            console.log("Notification sent for new peraturan:", code, data);
                        }
                    })
                }
            );
        }
        
        res.status(201).json({ success: true, data: peraturan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getPeraturan = async (req, res) => {
    try {
        const allPeraturan = await prisma.peraturan.findMany({});
        res.status(200).json({ success: true, data: allPeraturan });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const updatePeraturan = async (req, res) => {
    try {
        const { id } = req.params;
        const { judul, kategori, isi_peraturan } = req.body;

        // Konversi id ke Int
        const peraturan = await prisma.peraturan.update({
            where: { id: parseInt(id, 10) }, // Konversi id ke Int
            data: { judul, kategori, isi_peraturan },
        });

        // Broadcast ke Supabase
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "peraturan_updated",
            payload: peraturan,
        });

        // Ambil semua user untuk notifikasi
        const allUsers = await prisma.user.findMany({
            select: { id: true }
        });
        const userIds = allUsers.map(user => user.id);

        // Kirim notifikasi ke semua user
        if (userIds.length > 0) {
            await sendNotification(
                {
                    body: {
                        userId: userIds,
                        judul: "Peraturan Diperbarui",
                        isi: `Peraturan "${judul}" dalam kategori ${kategori} telah diperbarui. Silakan cek aplikasi untuk detail terbaru.`,
                        tipe: "Pemberitahuan"
                    }
                },
                {
                    status: (code) => ({
                        json: (data) => {
                            console.log("Notification sent for updated peraturan:", code, data);
                        }
                    })
                }
            );
        }

        res.status(200).json({ success: true, data: peraturan });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deletePeraturan = async (req, res) => {
    try {
        const { id } = req.params;
        const peraturan = await prisma.peraturan.delete({
            where: { id: parseInt(id, 10) },
        });
        res.status(200).json({ success: true, message: "Peraturan deleted" });
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "peraturan_deleted",
            payload: peraturan,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { createPeraturan, getPeraturan, updatePeraturan, deletePeraturan };