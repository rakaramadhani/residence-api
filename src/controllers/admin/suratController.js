const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getSurat = async (req, res) => {
  try {
    const surat = await prisma.surat.findMany();
    if (!surat.length) {
      return res.status(200).json({ message: "No surat found" });
    }
    res.status(200).json({ message: "Success", data: surat });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const updateSurat = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (status === "approved") {
      const surat = await prisma.surat.update({
        where: { id: id },
        data: { status: "approved", feedback: "Silahkan cek Email Anda" },
      });
      res
        .status(200)
        .json({ message: "Surat updated successfully", data: surat });
    }
    // Ambil user beserta semua anggotanya
    const surat = await prisma.surat.update({
      where: { id: id },
      data: { status: status, feedback: feedback },
    });

    res
      .status(200)
      .json({ message: "Surat updated successfully", data: surat });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { getSurat, updateSurat };
  

