const midtransClient = require("midtrans-client");
const { PrismaClient } = require("@prisma/client");

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

const checkTransaksi = async (req, res) => {
  const { orderId } = req.params;
  try {
    const transactionStatus = await coreApi.transaction.status(orderId);
    res.status(200).json(transactionStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const tokenizer = async (req, res) => {
  try {
    const { id } = req.body; // Ambil ID tagihan dari request
    // Ambil data tagihan dari database berdasarkan ID
    const tagihan = await prisma.tagihan.findUnique({
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
        order_id: `INV-${tagihan.id}`, // Bisa tambahkan prefix jika perlu
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

module.exports = { tokenizer, checkTransaksi };
