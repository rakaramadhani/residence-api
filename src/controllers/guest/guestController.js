const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");
const { PrismaClient } = require("@prisma/client");
const QRCode = require("qrcode");
const { sendNotification } = require("../admin/notificationController");

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const prisma = new PrismaClient();

const scanGuestPermission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "QR id is required" });
    }

    // Cari izin berdasarkan ID dari QR
    const permission = await prisma.guestPermission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            cluster: true,
            username: true,
            nomor_rumah: true,
            rt: true,
            rw: true,
            phone: true,
          },
        },
      },
    });

    if (!permission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Validasi tanggal saat ini
    const today = new Date();
    const start = new Date(permission.startVisitDate);
    const end = new Date(permission.endVisitDate);

    const isSameDate =
      today.toISOString().slice(0, 10) === start.toISOString().slice(0, 10);

    // if (!isSameDate) {
    //   return res
    //     .status(403)
    //     .json({ message: "QR code is not valid for today" });
    // }

    // Update status jika belum "arrived"
    if (permission.status !== "arrived") {
      await prisma.guestPermission.update({
        where: { id },
        data: { status: "arrived" },
      });
    }

    // Kirim notifikasi ke penghuni (selalu kirim)
    await sendNotification(
      {
        body: {
          userId: permission.user.id,
          judul: "Tamu Anda Telah Tiba",
          isi: ` ${permission.user.username}, Tamu atas nama ${permission.guestName} telah tiba di pintu masuk cluster.`,
          tipe: "Pemberithuan",
        },
      },
      {
        status: (code) => ({
          json: (data) => {
            console.log("Fake res status", code, data);
          },
        }),
      }
    );

    // Kirim data ke scanner (misal security)
    return res.status(200).json({
      message: "QR scanned successfully",
      data: {
        guestName: permission.guestName,
        status: "arrived",
        visitDate: permission.startVisitDate,
        penghuni: {
          penghuni: permission.user.username,
          cluster: permission.user.cluster,
          nomor_rumah: permission.user.nomor_rumah,
          rt: permission.user.rt,
          rw: permission.user.rw,
          phone: permission.user.phone,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};


// get history of guest permissions
const getGuestPermissionHistory = async (req, res) => {
  try {
    const allPermissions = await prisma.guestHistory.findMany({
      include: { user: true }
    });
    res.status(200).json({ message: "Success", data: allPermissions });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};  

module.exports = { scanGuestPermission, getGuestPermissionHistory };
