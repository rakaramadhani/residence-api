const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

// Pastikan env terbaca
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
const prisma = new PrismaClient();

const createEmergency = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { latitude, longitude } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const newEmergency = await prisma.emergency.create({
      data: {
        userId: user_id,
        latitude,
        longitude,
      },
    });

    const response = await supabase.channel("all_changes").send({
      type: "broadcast",
      event: "new_emergency",
      payload: newEmergency,
    });

    console.log("Supabase Event Sent:", response);
    return res.status(201).json({
      message: "Emergency reported successfully",
      data: newEmergency,
      supabaseResponse: response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmergency = async (req, res) => {
    try {
        const allEmergency = await prisma.emergency.findMany({});
        res.status(200).json({ message: "Success", data: allEmergency });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


module.exports = { createEmergency, getEmergency };
