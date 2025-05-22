const admin = require("../../firebase/firebase");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getTokens = async (userIds) => {
  const tokens = await prisma.fcmtoken.findMany({
    where: {
      userId: { in: userIds },
    },
    select: {
      token: true,
    },
  });
  return tokens.map((t) => t.token);
};

const notifikasiTagihan = async (req, res) => {
  const { record } = req.body;

  if (!record) {
    return res
      .status(400)
      .json({ success: false, message: "payload tidak valid" });
  }

  const { userId, id, bulan, tahun } = record;
  // Validasi input
  if (!userId || !id || !bulan || !tahun) {
    return res.status(400).json({
      success: false,
      message: "userID, id, bulan, tahun tidak boleh kosong",
    });
  }
  let namaBulan = "";
  switch (bulan) {
    case 1:
      namaBulan = "Januari";
      break;
    case 2:
      namaBulan = "Februari";
      break;
    case 3:
      namaBulan = "Maret";
      break;
    case 4:
      namaBulan = "April";
      break;
    case 5:
      namaBulan = "Mei";
      break;
    case 6:
      namaBulan = "Juni";
      break;
    case 7:
      namaBulan = "Juli";
      break;
    case 8:
      namaBulan = "Agustus";
      break;
    case 9:
      namaBulan = "September";
      break;
    case 10:
      namaBulan = "Oktober";
      break;
    case 11:
      namaBulan = "November";
      break;
    case 12:
      namaBulan = "Desember";
      break;
    default:
      return res
        .status(400)
        .json({ success: false, message: "Bulan tidak valid" });
  }
  try {
    // Ambil semua FCM token milik user
    const result = await prisma.fcmtoken.findMany({
      where: { userId },
      select: { token: true },
    });

    const tokens = result.map((r) => r.token);

    if (tokens.length === 0) {
      console.log(`User ${userId} tidak punya FCM token.`);
      return res.status(200).json({
        success: false,
        message: "Tidak ada token untuk user ini",
      });
    }

    const messaging = admin.messaging();
    const message = {
      notification: {
        title: "Tagihan Baru!",
        body: `Tagihan untuk bulan ${namaBulan} ${tahun} telah tersedia`,
      },
      tokens,
    };

    // Kirim notifikasi ke semua token
    const response = await messaging.sendEachForMulticast(message);

    console.log(
      `Notifikasi dikirim ke user ${userId}. Sukses: ${response.successCount}, Gagal: ${response.failureCount}`
    );
    console.log("Responses:", response.responses);
    res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      responses: response.responses, // detail per token
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// const sendNotification = async (req, res) => {
//   let { userId, judul, isi, tipe } = req.body;

//   // Validasi input
//   if (!userId || !judul || !isi || !tipe) {
//     return res.status(400).json({
//       success: false,
//       message: "userId, judul, isi, dan tipe harus diisi",
//     });
//   }

//   // Pastikan userId selalu dalam bentuk array
//   const userIds = Array.isArray(userId) ? userId : [userId];

//   const title = `${judul} - ${tipe}`;
//   const body = isi;

//   try {
//     // Simpan notifikasi ke DB untuk semua userId
//     await Promise.all(
//       userIds.map((id) =>
//         prisma.notifikasi.create({
//           data: {
//             userId: id,
//             judul,
//             isi,
//             tipe,
//           },
//         })
//       )
//     );

//     // Ambil semua token FCM berdasarkan userId
//     const tokens = await getTokens(userIds); // Anda harus pastikan getTokens bisa menerima array dan mengembalikan semua token

//     if (!tokens.length) {
//       console.log(`User ${userIds.join(", ")} tidak punya FCM token.`);
//       return res.status(200).json({
//         success: false,
//         message: "Tidak ada token untuk user ini",
//       });
//     }

//     const messaging = admin.messaging();

//     const message = {
//       notification: { title, body },
//       tokens: tokens, // array of tokens
//     };

//     const response = await messaging.sendEachForMulticast(message);

//     console.log(
//       "Multicast sent. Success:",
//       response.successCount,
//       " Failure:",
//       response.failureCount
//     );

//     res.status(200).json({
//       success: true,
//       sent: response.successCount,
//       failed: response.failureCount,
//       responses: response.responses,
//     });
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

const sendNotification = async (req, res) => {
  let { userId, judul, isi, tipe } = req.body;

  // Validasi input
  if (!userId || !judul || !isi || !tipe) {
    return res.status(400).json({
      success: false,
      message: "userId, judul, isi, dan tipe harus diisi",
    });
  }

  // Pastikan userId selalu dalam bentuk array
  const userIds = Array.isArray(userId) ? userId : [userId];

  const title = `${judul} - ${tipe}`;
  const body = isi;

  try {
    // Simpan notifikasi ke DB untuk semua userId
    await Promise.all(
      userIds.map((id) =>
        prisma.notifikasi.create({
          data: {
            userId: id,
            judul,
            isi,
            tipe,
          },
        })
      )
    );

    // Ambil semua token FCM berdasarkan userId
    const tokens = await getTokens(userIds);

    if (!tokens.length) {
      console.log(`User ${userIds.join(", ")} tidak punya FCM token.`);
      return res.status(200).json({
        success: false,
        message: "Tidak ada token untuk user ini",
      });
    }

    const messaging = admin.messaging();

    const message = {
      notification: { title, body },
      tokens, // array of tokens
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log(
      "Multicast sent. Success:",
      response.successCount,
      " Failure:",
      response.failureCount
    );

    res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      responses: response.responses,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  sendNotification,
  notifikasiTagihan,
};
