const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fungsi untuk mendapatkan semua transaksi
exports.getAllTransaksi = async (req, res) => {
  try {
    const transaksi = await prisma.transaksi.findMany({
      include: {
        order: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
                phone: true,
                cluster: true,
                nomor_rumah: true,
                rt: true,
                rw: true
              }
            }
          }
        }
      },
      orderBy: {
        transactionTime: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data transaksi',
      data: transaksi
    });
  } catch (error) {
    console.error('Error pada getAllTransaksi:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Fungsi untuk mendapatkan detail transaksi berdasarkan ID
exports.getTransaksiById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaksi = await prisma.transaksi.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                email: true,
                username: true,
                phone: true,
                cluster: true,
                nomor_rumah: true,
                rt: true,
                rw: true
              }
            }
          }
        }
      }
    });

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail transaksi',
      data: transaksi
    });
  } catch (error) {
    console.error('Error pada getTransaksiById:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};
