const midtransClient = require("midtrans-client");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

let snap = new midtransClient.Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_CLIENT,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const tokenizer = async (req, res) => {
  try {
    const { id } = req.body; // Ambil ID tagihan dari request

    // Ambil data tagihan dari database berdasarkan ID
    const tagihan = await prisma.iuran.findUnique({
      where: { id: id },
      include: {
        user: true,
      },
    });

    // Jika tidak ditemukan
    if (!tagihan) {
      return res
        .status(404)
        .json({ success: false, message: "Tagihan tidak ditemukan" });
    }

    // Parameter untuk Midtrans
    let parameter = {
      transaction_details: {
        order_id: tagihan.id, // Bisa tambahkan prefix jika perlu
        gross_amount: tagihan.nominal,
      },
      item_details: [
        {
          id: tagihan.id.toString(),
          name: `Pembayaran ${tagihan.user.username}`,
          price: tagihan.nominal,
          quantity: 1,
        },
      ],
      customer_details: {
        first_name: tagihan.user.username,
        email: tagihan.user.email,
      },
    };

    // Buat token Midtrans
    const transactionToken = await snap.createTransactionToken(parameter);

    // Kirim token ke frontend
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

// tes ubah status
const handleNotification = async (req, res) => {
  try {
    const notification = req.body;

    // Ambil order_id dari notifikasi
    const orderId = notification.order_id; // Sesuai dengan `INV-{tagihan.id}`
    const transactionStatus = notification.transaction_status;

    // Ambil ID tagihan dari orderId (karena kita tambahkan prefix "INV-")
    const tagihanId = orderId.replace("INV-", "");

    // Ambil data tagihan dari database
    const tagihan = await prisma.tagihan.findUnique({
      where: { id: tagihanId },
      include: { user: true },
    });

    if (!tagihan) {
      return res.status(404).json({ success: false, message: "Tagihan tidak ditemukan" });
    }

    // Simpan data notifikasi ke tabel transaksi
    await prisma.transaksi.create({
      data: {
        orderId: orderId,
        userId: tagihan.userId,
        grossAmount: parseFloat(notification.gross_amount),
        currency: notification.currency,
        paymentType: notification.payment_type,
        transactionStatus: notification.transaction_status,
        fraudStatus: notification.fraud_status || null,
        vaBank: notification.biller_code || null, // Nama bank atau kode biller
        vaNumber: notification.bill_key || null, // Nomor virtual account
        transactionTime: new Date(notification.transaction_time),
        settlementTime: notification.settlement_time ? new Date(notification.settlement_time) : null,
        expiryTime: new Date(notification.expiry_time),
      },
    });

    // Periksa apakah transaksi berhasil
    if (transactionStatus === "settlement") {
      // Update status pembayaran menjadi lunas
      await prisma.tagihan.update({
        where: { id: tagihanId },
        data: { status_bayar: "lunas", metode_bayar: "otomatis" },
      });
    }

    res.status(200).json({ success: true, message: "Notifikasi diproses" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan", error: error.message });
  }
};

module.exports = { tokenizer, checkTransaksi, handleNotification };



