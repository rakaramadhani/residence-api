const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const app = express();
const prisma = new PrismaClient();
dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.use(express.json());

// login user
const login = async (req, res) => {
  const { email, password } = req.body;
  const secret = process.env.SECRET_KEY;
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== "penghuni") {
      return res
        .status(403)
        .json({ message: "Access denied: Only penghuni can login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, role: "penghuni" }, secret, {
      expiresIn: "1d",
    });
    return res.json({
      token,
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      message: "Login successful",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// detail user
const userDetails = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        phone:true,
        nomor_rumah: true,
        rt: true,
        rw: true,
        cluster: true
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User Details", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" }); // Return a server error response
  }
};

// lengkapi data user
const updateDataUser = async (req, res) => {
  const { user_id } = req.params;
  const { password, phone, rt, rw, nomor_rumah,cluster } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userDetailData = await prisma.user.update({
      where: { id: user_id },
      data: {  password: hashedPassword, phone, rt, rw, nomor_rumah, cluster },
    });
    const response = await supabase.channel("all_changes").send({
      type: "broadcast",
      event: "new_user_detail",
      payload: userDetailData,
    });

    console.log("Supabase Event Sent:", response);
    res.status(200).json({ message: "success", data: userDetailData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// logout
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Reset Password - Kirim Email dengan Token
const resetPassword = async (req, res) => {
  const { email } = req.body;
  const secret = process.env.SECRET_KEY;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Buat token untuk reset password
    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret,
      { expiresIn: "1h" } // Token berlaku selama 1 jam
    );

    const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

    // Konfigurasi email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password",
      text: `Klik link berikut untuk mereset password Anda: ${resetLink}`,
    };

    // Kirim email
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ message: "Reset password link sent to your email" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Endpoint untuk mengganti password setelah mendapatkan token
const changePassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const secret = process.env.SECRET_KEY;

  try {
    const decoded = jwt.verify(token, secret);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword },
    });

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  login,
  userDetails,
  logout,
  resetPassword,
  changePassword,
  updateDataUser,
};
