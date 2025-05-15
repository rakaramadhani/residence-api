const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// create broadcast
// Buat Broadcast
const createBroadcast = async (req, res) => {
  const { user_id } = req.params;
  const { kategori, broadcast, tanggal_acara } = req.body;
  try {
    // Simpan data ke database
    const newBroadcast = await prisma.broadcast.create({
      data: {
        userId: user_id,
        kategori,
        broadcast,
        tanggal_acara: tanggal_acara || null,
        status_broadcast: "approved",
      },
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

// Get All Broadcast
const broadcast = async (req, res) => {
  try {
    const allUsers = await prisma.broadcast.findMany({});
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

module.exports = { broadcast, updateBroadcast, createBroadcast };
