const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();
const { sendNotification } = require("./notificationController");

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Buat Broadcast
const createBroadcast = async (req, res) => {
  const { user_id } = req.params;
  const { kategori, broadcast, tanggal_acara } = req.body;
  let fotoUrl = null;

  try {
    // Jika ada foto yang di-upload, proses upload foto
    if (req.file) {
      const fileExt = req.file.originalname.split(".").pop();
      const fileName = `broadcast_${Date.now()}.${fileExt}`;
      const filePath = `broadcast/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (uploadError) throw uploadError;

      // Ambil public URL setelah upload sukses
      const { data: { publicUrl } } = supabase
        .storage
        .from("uploads")
        .getPublicUrl(filePath);

      fotoUrl = publicUrl;  // Set URL foto baru
    }

    // Simpan data ke database
    const newBroadcast = await prisma.broadcast.create({
      data: {
        userId: user_id,
        kategori,
        broadcast,
        tanggal_acara: tanggal_acara || null,
        foto: fotoUrl, // Simpan foto URL jika ada
        status_broadcast: "approved",
      },
    });

    // Broadcast ke Supabase
    const response = await supabase.channel("all_changes").send({
      type: "broadcast",
      event: "new_broadcast",
      payload: newBroadcast,
    });

    console.log("Supabase Event Sent:", response);

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
            judul: "Broadcast dari Admin",
            isi: `Pemberitahuan baru. Silakan cek aplikasi untuk detail lebih lanjut.`,
            tipe: "Pemberitahuan"
          }
        },
        {
          status: (code) => ({
            json: (data) => {
              console.log("Notification sent for new broadcast:", code, data);
            }
          })
        }
      );
    }

    res.status(201).json({ success: true, data: newBroadcast });
  } catch (error) {
    console.error("Create Broadcast Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Broadcast
const broadcast = async (req, res) => {
  try {
    const allUsers = await prisma.broadcast.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({ message: "Success", data: allUsers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Update Kendala (PUT) - Hanya Admin
const updateBroadcast = async (req, res) => {
  const { id } = req.params; // Ambil ID dari parameter URL
  const { status_broadcast, feedback } = req.body;

  try {
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });
    }

    console.log("ID yang diterima:", id); // Debugging

    const updatedBroadcast = await prisma.broadcast.update({
      where: { id: id }, // Jika UUID, gunakan langsung
      data: { status_broadcast: status_broadcast, feedback: feedback },
    });

    res.status(200).json({ success: true, data: updatedBroadcast });
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Broadcast
const deleteBroadcast = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.broadcast.delete({ where: { id: id } });
    res.status(200).json({ success: true, message: "Broadcast deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { broadcast, updateBroadcast, createBroadcast, deleteBroadcast };
