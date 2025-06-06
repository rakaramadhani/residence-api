const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require("dotenv");
dotenv.config();
const { sendNotification } = require("./notificationController");

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
    const { status_pengaduan, feedback } = req.body;

    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "ID is required" });
        }

        console.log("ID yang diterima:", id);

        // Ambil data pengaduan lama terlebih dahulu untuk mendapatkan userId
        const existingPengaduan = await prisma.pengaduan.findUnique({
            where: { id: id },
            include: { user: true }
        });

        if (!existingPengaduan) {
            return res.status(404).json({ success: false, message: "Pengaduan tidak ditemukan" });
        }

        const updatedPengaduan = await prisma.pengaduan.update({
            where: { id: id },
            data: { 
                status_pengaduan: status_pengaduan , 
                feedback: feedback 
            },
            include: { user: true }
        });

        // Broadcast ke Supabase
        const response = await supabase.channel("all_changes").send({
                type: "broadcast",
                event: "updated_pengaduan",
                payload: updatedPengaduan,
        });

        // Kirim notifikasi ke user pemilik pengaduan
        let notificationMessage = "";
        let notificationTitle = "";

        if (status_pengaduan === "Ditangani") {
            notificationTitle = "Pengaduan Sedang Ditangani";
            notificationMessage = `Pengaduan Anda sedang ditangani oleh admin. Terima kasih atas laporan Anda.`;
            if (feedback) {
                notificationMessage += ` Catatan: ${feedback}`;
            }
        } else if (status_pengaduan === "Selesai") {
            notificationTitle = "Pengaduan Selesai";
            notificationMessage = `Pengaduan Anda telah selesai ditangani.`;
            if (feedback) {
                notificationMessage += ` Feedback: ${feedback}`;
            }
        } else if (status_pengaduan === "PengajuanBaru") {
            notificationTitle = "Status Pengaduan Diperbarui";
            notificationMessage = `Status pengaduan Anda telah dikembalikan ke status PengajuanBaru.`;
            if (feedback) {
                notificationMessage += ` Catatan: ${feedback}`;
            }
        } else {
            notificationTitle = "Status Pengaduan Diperbarui";
            notificationMessage = `Status pengaduan Anda telah diperbarui menjadi: ${status_pengaduan}`;
            if (feedback) {
                notificationMessage += `. Feedback: ${feedback}`;
            }
        }

        // Kirim notifikasi ke user pemilik pengaduan
        await sendNotification(
            {
                body: {
                    userId: existingPengaduan.userId,
                    judul: notificationTitle,
                    isi: notificationMessage,
                    tipe: "Pemberitahuan"
                }
            },
            {
                status: (code) => ({
                    json: (data) => {
                        console.log("Notification sent for pengaduan update:", code, data);
                    }
                })
            }
        );

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