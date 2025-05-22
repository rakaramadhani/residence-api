const dotenv = require("dotenv");
dotenv.config(); // Load dotenv di awal
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");

// Pastikan env terbaca
const supabase = createClient(process.env.SUPABASE_URL,  process.env.SUPABASE_SERVICE_ROLE_KEY);
const prisma = new PrismaClient();


// get all broadcast
const getAllBroadcast = async (req, res) => {
    try{
        const allBroadcast = await prisma.broadcast.findMany({
            where: {status_broadcast:"approved"}, include: { user: { select: { username: true, email: true } } }, orderBy: { createdAt: "desc" },
        });
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
            where: { userId: user_id }, orderBy: { createdAt: "desc" },
        });
        if (!data.length) {
            return res.status(404).json({ message: "No data found" });
        }
        res.status(200).json({ message: "Success", data });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// broadcast dari admin 
const getAdminBroadcast = async (req, res) => {
    try {
      const latestBroadcast = await prisma.broadcast.findFirst({
        where: {
          user: {
            role: 'admin',
          },
        },
        orderBy: {
          createdAt: 'desc', // ambil yang terbaru
        },
        include: {
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
      });
  
      if (!latestBroadcast) {
        return res.status(200).json({ message: "Tidak ada broadcast dari admin" });
      }
  
      res.status(200).json({ message: "Success", data: latestBroadcast });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
  
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
                broadcast,
                kategori,
                tanggal_acara: tanggal_acara || null,
                foto: fotoUrl, // Simpan foto URL jika ada
            },
        });

        // Kirim event realtime ke Supabase dengan data termasuk foto
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "new_broadcast",
            payload: newBroadcast,
        });

        console.log("Supabase Event Sent:", response);

        res.status(201).json({ success: true, data: newBroadcast });
    } catch (error) {
        console.error("Create Broadcast Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBroadcast = async (req, res) => {
    const { id, user_id } = req.params;
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

        // Update broadcast di database (update foto jika ada foto baru)
        const updatedBroadcast = await prisma.broadcast.update({
            where: { id: id, userId: user_id },
            data: {
                kategori,
                broadcast,
                tanggal_acara: tanggal_acara || null,
                foto: fotoUrl ? fotoUrl : undefined,  // Hanya update foto jika ada foto baru
            },
        });

        // Kirim event realtime ke Supabase dengan data termasuk foto
        const response = await supabase.channel("all_changes").send({
            type: "broadcast",
            event: "updated_broadcast",
            payload: updatedBroadcast,
        });

        console.log("Supabase Event Sent:", response);

        res.status(200).json({ success: true, data: updatedBroadcast });
    } catch (error) {
        console.error("Update Broadcast Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};



const deleteBroadcast = async (req, res) => {
    try {
        const { user_id, id } = req.params;

        // 1. Ambil data broadcast dulu (untuk ambil URL foto)
        const existing = await prisma.broadcast.findUnique({
            where: { id: id },
        });

        if (!existing || existing.userId !== user_id) {
            return res.status(404).json({ message: "Broadcast tidak ditemukan" });
        }

        // 2. Ambil path file dari public URL
        let filePath = null;
        if (existing.foto) {
            const url = new URL(existing.foto);
            filePath = url.pathname.replace("/storage/v1/object/public/uploads/", "");
        }

        // 3. Hapus data dari database
        const deleted = await prisma.broadcast.delete({
            where: { id: id },
        });

        // 4. Hapus file dari Supabase Storage
        if (filePath) {
            const { error: deleteError } = await supabase.storage
                .from("uploads")
                .remove([filePath]);

            if (deleteError) {
                console.warn("Gagal hapus foto broadcast dari Supabase Storage:", deleteError.message);
            }
        }

        // 5. Broadcast realtime
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


module.exports = {getAllBroadcast,getBroadcast,getAdminBroadcast,createBroadcast,updateBroadcast,deleteBroadcast};