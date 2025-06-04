const midtransClient = require("midtrans-client");
const { PrismaClient } = require("@prisma/client");
const { sendNotification } = require("../admin/notificationController");

const prisma = new PrismaClient();

let snap = new midtransClient.Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});
const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const tokenizer = async (req, res) => {
  try {
    const { id } = req.body;

    const tagihan = await prisma.tagihan.findUnique({
      where: { id: id },
      include: { user: true },
    });

    if (!tagihan) {
      return res.status(404).json({
        success: false,
        message: "Tagihan tidak ditemukan",
      });
    }

    // Cek apakah sudah ada token dan belum expire
    if (tagihan.snap_token) {
      // Panggil Midtrans untuk cek status order_id
      try {
        const status = await snap.transaction.status(tagihan.id);

        if (status.transaction_status === "pending") {
          return res.status(200).json({
            success: true,
            snap_token: tagihan.snap_token,
            reused: true, // hanya info tambahan
          });
        }
      } catch (err) {
        console.log("Gagal ambil status dari Midtrans:", err.message);
        // Lanjut buat baru
      }
    }

    // Jika belum ada atau transaksi sebelumnya tidak pending, buat token baru
    let parameter = {
      transaction_details: {
        order_id: tagihan.id,
        gross_amount: tagihan.nominal,
      },
      item_details: [
        {
          id: tagihan.id.toString(),
          name: `Pembayaran IPL ${tagihan.user.username} BULAN ${tagihan.bulan} TAHUN ${tagihan.tahun}`,
          price: tagihan.nominal,
          quantity: 1,
        },
      ],
      customer_details: {
        first_name: tagihan.user.username,
        email: tagihan.user.email,
        phone: tagihan.user.phone,
      },
    };

    const transactionToken = await snap.createTransactionToken(parameter);

    // Simpan snap_token ke database
    await prisma.tagihan.update({
      where: { id: tagihan.id },
      data: { snap_token: transactionToken },
    });

    res.status(200).json({ success: true, snap_token: transactionToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan",
      error: error.message,
    });
  }
};

// cek transaksi
const checkTransaksi = async (req, res) => {
  const { orderId } = req.params;
  try {
    const transactionStatus = await coreApi.transaction.status(orderId);

    const {
      order_id,
      payment_type,
      gross_amount,
      transaction_time,
      issuer,
      acquirer,
    } = transactionStatus;

    res.status(200).json({
      order_id,
      payment_type,
      gross_amount,
      transaction_time,
      issuer,
      acquirer,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ubah status
const handleNotification = async (req, res) => {
  try {
    const notification = req.body;

    // Ambil order_id dari notifikasi
    const orderId = notification.order_id;
    // rubah orderId menjadi format uuid
    const transactionStatus = notification.transaction_status;

    // Extract tagihanId dari order_id
    const tagihanId = orderId.split("_").pop();

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(tagihanId)) {
      return res
        .status(400)
        .json({ success: false, message: "Format UUID tidak valid" });
    }

    // Ambil data tagihan dari database
    const tagihan = await prisma.tagihan.findUnique({
      where: { id: tagihanId },
      include: { user: true },
    });

    if (!tagihan) {
      console.log("Tagihan tidak ditemukan untuk ID:", tagihanId);
      return res
        .status(200)
        .json({ success: false, message: "Tagihan tidak ditemukan" });
    }

    // Cek status transaksi, jika "settlement", update status tagihan menjadi "Lunas"
    if (transactionStatus === "settlement") {
      // Update status tagihan menjadi "Lunas"
      const updatedTagihan = await prisma.tagihan.update({
        where: { id: tagihanId },
        data: {
          status_bayar: "lunas", // Ubah status menjadi "Lunas"
        },
      });
      // Kirim notifikasi pembayaran berhasil
      await sendNotification(
        {
          body: {
            userId: tagihan.userId,
            judul: "Berhasil melakukan pembayaran",
            isi: `Terimakasih ${tagihan.user.username},  pembayaran tagihan IPL telah berhasil.`,
            tipe: "Pembayaran",
          },
        },
        {
          status: (code) => ({
            json: (data) => {
              // Bisa log response jika mau, atau kosongkan saja
              console.log("Fake res status", code, data);
            },
          }),
        }
      );
      const transaksi = await prisma.transaksi.create({
        data: {
          userId: tagihan.userId,
          grossAmount: parseFloat(notification.gross_amount),
          currency: notification.currency,
          paymentType: notification.payment_type,
          transactionStatus: notification.transaction_status,
          fraudStatus: notification.fraud_status || null,
          vaBank: notification.biller_code || null,
          vaNumber: notification.bill_key || null,
          transactionTime: new Date(notification.transaction_time),
          settlementTime: notification.settlement_time
            ? new Date(notification.settlement_time)
            : null,
          expiryTime: notification.expiry_time
            ? new Date(notification.expiry_time)
            : null,
          order: {
            connect: { id: tagihan.id },
          },
        },
      });
    }

    // Mengirimkan respon sukses setelah update
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("Terjadi error saat memproses notifikasi:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses notifikasi",
      error: error.message,
    });
  }
};

module.exports = { tokenizer, checkTransaksi, handleNotification };
