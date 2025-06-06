const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const prisma = new PrismaClient();
const QRCode = require("qrcode");

dotenv.config();

// Get Guest Permissions
const getGuestPermissions = async (req, res) => {
  try {
    const { user_id } = req.params;
    const permissions = await prisma.guestPermission.findMany({
      where: { userId: user_id },
      orderBy: { createdAt: "desc" },
    });
    if (!permissions.length) {
      return res.status(200).json({ message: "No permissions found" });
    }
    res.status(200).json({ message: "Success", data: permissions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const createGuestPermission = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { guestName, startVisitDate, endVisitDate } = req.body;

    // Validasi input dasar
    if (!guestName || !startVisitDate || !endVisitDate) {
      return res.status(400).json({
        message: "guestName, startVisitDate, and endVisitDate are required",
      });
    }

    // Validasi tanggal: endVisitDate tidak boleh sebelum startVisitDate
    const start = new Date(startVisitDate);
    const end = new Date(endVisitDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (end < start) {
      return res.status(400).json({
        message: "endVisitDate cannot be earlier than startVisitDate",
      });
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Simpan data awal ke DB
    const newPermission = await prisma.guestPermission.create({
      data: {
        userId: user.id,
        guestName,
        startVisitDate,
        endVisitDate,
      },
    });
    // simpan ke history
    const history = await prisma.guestPermissionHistory.create({
      data: {
        userId: user.id,
        guestName,
        startVisitDate,
        endVisitDate,
      },
    });

    // Buat isi QR sebagai JSON string
    const qrPayload = {
      id: permissionId,
      userId: user.id,
      userName: user.username,
      guestName,
      startVisitDate,
      endVisitDate,
      status: newPermission.status,
    };
    const qrData = JSON.stringify(qrPayload);

    // Generate QR code (buffer PNG)
    const qrBuffer = await QRCode.toBuffer(qrData, { type: "png" });

    // Upload ke Supabase Storage
    const fileName = `guest-permissions/${permissionId}.png`;
    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(fileName, qrBuffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ message: "QR upload failed" });
    }

    // Ambil public URL QR
    const { data: publicUrlData } = supabase.storage
      .from("uploads")
      .getPublicUrl(fileName);

    const qrUrl = publicUrlData.publicUrl;

    // Update izin dengan URL QR
    const updatedPermission = await prisma.guestPermission.update({
      where: { id: permissionId },
      data: { qrUrl },
    });

    res.status(200).json({
      message: "Permission created successfully",
      data: updatedPermission,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// delete Guest Permission
const deleteGuestPermission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "permissionId is required" });
    }

    // Ambil data izin sebelum dihapus, untuk tahu URL QR-nya
    const existingPermission = await prisma.guestPermission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Ekstrak nama file dari URL (jika ada QR)
    if (existingPermission.qrUrl) {
      const urlParts = existingPermission.qrUrl.split("/");
      const fileName = urlParts.slice(-2).join("/"); // contoh: guest-permissions/abc123.png

      // Hapus file dari bucket 'uploads'
      const { error: deleteError } = await supabase.storage
        .from("uploads")
        .remove([fileName]);

      if (deleteError) {
        console.warn("Gagal hapus file QR:", deleteError.message);
      }
    }

    // Hapus data izin dari DB
    const deletedPermission = await prisma.guestPermission.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Permission deleted successfully",
      data: deletedPermission,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  getGuestPermissions,
  createGuestPermission,
  deleteGuestPermission,
};
