const { PrismaClient } = require("@prisma/client");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const joi = require("joi");
const nodemailer = require("nodemailer");
const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const prisma = new PrismaClient();
app.use(express.json());

const userSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  // phone: joi
  //     .string()
  //     .pattern(/^[0-9]+$/)
  //     .min(10)
  //     .max(15),
  nomor_rumah: joi.string(),
  rt: joi.string(),
  rw: joi.string(),
  cluster: joi.string(),
  clusterId: joi.number().integer(),
});

const userCreateSchema = joi.object({
  email: joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: joi.string().min(8).required().messages({
    "string.min": "Password minimal 8 karakter",
    "any.required": "Password wajib diisi",
  }),
  nomor_rumah: joi.string().required().messages({
    "any.required": "Nomor rumah wajib diisi",
  }),
  rt: joi.string().required().messages({
    "any.required": "RT wajib diisi",
  }),
  rw: joi.string().required().messages({
    "any.required": "RW wajib diisi",
  }),
  clusterId: joi.number().integer().required().messages({
    "any.required": "Cluster wajib dipilih",
  }),
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const users = async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany({
            where: {
                role: "penghuni",
                isActive: true // Hanya ambil user aktif
            },
            include: {
                clusterRef: {
                    select: {
                        id: true,
                        nama_cluster: true,
                        nominal_tagihan: true
                    }
                },
                penghuni: true
            }
        });
        res.status(200).json({ data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Membuat user
const createUser = async (req, res) => {
  const { email, password, nomor_rumah, rt, rw, clusterId } = req.body;

  // Validasi input dengan skema baru
  const { error } = userCreateSchema.validate({
    email,
    password,
    nomor_rumah,
    rt,
    rw,
    clusterId,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Persiapkan data user
    const userData = {
      email,
      password: hashedPassword,
      nomor_rumah,
      rt,
      rw,
      role: "penghuni", // Default role
      isVerified: false, // Default belum terverifikasi
    };

    // Tambahkan clusterId jika ada
    if (clusterId) {
      userData.clusterId = parseInt(clusterId, 10);

      // Dapatkan nama cluster untuk disimpan di field cluster
      const clusterData = await prisma.cluster.findUnique({
        where: { id: parseInt(clusterId, 10) },
        select: { nama_cluster: true },
      });

      if (clusterData) {
        userData.cluster = clusterData.nama_cluster;
      }
    }

    // Simpan user baru
    const user = await prisma.user.create({
      data: userData,
      include: {
        clusterRef: true,
      },
    });

    // Kirim email notifikasi (dengan error handling)
    let emailSent = false;
    let emailError = null;
    
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "AKUN PENGHUNI BARU",
        text: `Selamat datang di sistem kami, ${user.email}.

    Akun Anda telah berhasil dibuat dengan detail berikut:
    - Email: ${user.email}
    - Password: ${password}

    Silakan gunakan kredensial di atas untuk masuk ke sistem kami.`,
      };

      // Kirim email
      await transporter.sendMail(mailOptions);
      emailSent = true;
      console.log("Email berhasil dikirim ke:", user.email);
    } catch (emailErr) {
      emailError = emailErr.message;
      console.error("Error mengirim email:", emailErr.message);
    }

    // Notifikasi melalui Supabase
    try {
      const response = await supabase.channel("all_changes").send({
        type: "broadcast",
        event: "user",
        payload: user,
      });
    } catch (supabaseErr) {
      console.error("Error Supabase notification:", supabaseErr.message);
    }

    res.status(201).json({
      success: true,
      message: emailSent 
        ? "User berhasil dibuat dan email notifikasi terkirim"
        : `User berhasil dibuat, namun email gagal terkirim: ${emailError}`,
      data: user,
      emailSent: emailSent,
      emailError: emailError
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      error: error.message,
    });
  }
};

// detail user
const detail = async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await prisma.user.findFirst({
      where: {
        id: user_id,
        isActive: true, // Hanya ambil user aktif
      },
      include: {
        clusterRef: true,
        penghuni: true, // Include data penghuni jika ada
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User Details", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

//verifikasi data user
const verifikasiUser = async (req, res) => {
  const { user_id } = req.params;
  const { isVerified, feedback } = req.body;
  try {
    const verifikasi = await prisma.user.update({
      where: { id: user_id },
      data: { isVerified, feedback },
    });
    res.status(200).json({ message: "success", data: verifikasi });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Update user data
const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { email, nomor_rumah, rt, rw, cluster, clusterId, phone, password } =
    req.body;

  try {
    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Persiapkan data untuk update
    const updateData = {};

    if (email) updateData.email = email;
    if (nomor_rumah) updateData.nomor_rumah = nomor_rumah;
    if (rt) updateData.rt = rt;
    if (rw) updateData.rw = rw;
    if (cluster) updateData.cluster = cluster;
    if (phone) updateData.phone = phone;

    // Jika password diubah, hash password baru
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update clusterId jika ada
    if (clusterId !== undefined) {
      if (clusterId === null) {
        updateData.clusterId = null;
      } else {
        updateData.clusterId = parseInt(clusterId, 10);
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user_id },
      data: updateData,
      include: {
        clusterRef: true,
      },
    });

    res.status(200).json({
      message: "User berhasil diperbarui",
      data: updatedUser,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already in use" });
    }
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Fungsi untuk mendapatkan daftar cluster (tambahkan)
const getClustersForDropdown = async (req, res) => {
  try {
    const clusters = await prisma.cluster.findMany({
      select: {
        id: true,
        nama_cluster: true,
      },
      orderBy: {
        nama_cluster: "asc",
      },
    });

    res.status(200).json({
      message: "Success",
      data: clusters,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data cluster",
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Soft delete dengan mengatur isActive menjadi false dan mengisi deletedAt
    const deletedUser = await prisma.user.update({
      where: { id: user_id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        feedback: user.feedback
          ? `DELETED_USER - ${new Date().toISOString()} - ${user.feedback}`
          : `DELETED_USER - ${new Date().toISOString()}`,
      },
    });

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus (soft delete)",
    });
  } catch (error) {
    console.error("Error soft deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus user",
      error: error.message,
    });
  }
};

// Restorasi user yang telah di-soft delete
const restoreUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    // Cek apakah user ada
    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User sudah aktif",
      });
    }

    // Memulihkan user
    const restoredUser = await prisma.user.update({
      where: { id: user_id },
      data: {
        isActive: true,
        deletedAt: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "User berhasil dipulihkan",
      data: restoredUser,
    });
  } catch (error) {
    console.error("Error restoring user:", error);
    res.status(500).json({
      success: false,
      message: "Gagal memulihkan user",
      error: error.message,
    });
  }
};

// Mendapatkan daftar user yang telah di-soft delete
const deletedUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "penghuni",
        isActive: false,
        deletedAt: {
          not: null,
        },
      },
      include: {
        clusterRef: {
          select: {
            id: true,
            nama_cluster: true,
            nominal_tagihan: true,
          },
        },
      },
    });
    res.status(200).json({
      success: true,
      message: "Daftar user terhapus",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  users,
  createUser,
  verifikasiUser,
  detail,
  updateUser,
  getClustersForDropdown,
  deleteUser,
  restoreUser,
  deletedUsers,
};
