const dotenv = require("dotenv");
dotenv.config();

const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const prisma = new PrismaClient();

const createFCM = async (req, res) => {
  try {
    const { user_id, token } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Cek apakah token sudah ada untuk user ini
    const existing = await prisma.fcmtoken.findFirst({
      where: {
        userId: user_id,
        token: token,
      },
    });

    if (existing) {
      return res.status(200).json({
        message: "FCM token already exists for this user",
        data: existing,
      });
    }

    // Simpan token baru
    const newFCM = await prisma.fcmtoken.create({
      data: {
        userId: user_id,
        token,
      },
    });

    return res.status(201).json({
      message: "FCM token created successfully",
      data: newFCM,
    });
  } catch (error) {
    console.error("Error creating FCM token:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFCM,
};
