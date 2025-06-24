const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
dotenv.config();

app.use(express.json());

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Login Admin
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const secret = process.env.SECRET_KEY;
        // Validasi input
        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password harus diisi" });
        }

        // Cek user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Hanya admin yang dapat login" });
        }

        // Cek apakah user aktif
        if (user.isActive === false) {
            return res.status(403).json({ message: "Access denied: Akun anda telah dinonaktifkan" });
        }

        // Jika password belum di-set
        if (!user.password) {
            return res.status(400).json({ message: 'Password belum di-set' });
        }

        // Cek password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Email atau password salah' });
        }

        // Buat token JWT
        const token = jwt.sign(
            {   id: user.id, 
                role: "admin" 
            }, 
            secret,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            token,
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
            message: 'Login berhasil'
        });

    } catch (error) {
        console.error("Login Error: ", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const userDetails = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({ 
            where: { 
                id: req.user.id,
                isActive: true // Hanya ambil user aktif
            } 
        });
        if (!user) {
        return res.status(404).json({ message: "Pengguna tidak ditemukan" });
        }
        res.status(200).json({ message: "Detail Pengguna", data: user });
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ message: "Server error" });
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logout berhasil" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Forgot Password - Kirim Email dengan Token untuk Admin
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const secret = process.env.SECRET_KEY;

    try {
        // Validasi input
        if (!email) {
            return res.status(400).json({ message: "Email harus diisi" });
        }

        // Cek user dan pastikan adalah admin
        const user = await prisma.user.findUnique({ where: { email } });
        
        if (!user) {
            // Untuk keamanan, kirim respon yang sama walaupun user tidak ditemukan
            return res.status(200).json({ 
                message: "Jika email terdaftar, tautan untuk reset password telah dikirim." 
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Hanya admin yang dapat menggunakan fitur ini" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Access denied: Akun anda telah dinonaktifkan" });
        }

        // Buat token untuk reset password
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            secret,
            { expiresIn: "1h" } // Token berlaku selama 1 jam
        );

        const resetLink = `https://residence-admin.vercel.app/reset-password?token=${token}`;

        // Konfigurasi email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Reset Password Admin - Cherry Field Residence",
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #1e3a8a; text-align: center; margin-bottom: 30px;">Reset Password Admin</h2>
                        
                        <p>Halo <strong>${user.username || 'Admin'}</strong>,</p>
                        
                        <p>Kami menerima permintaan untuk mereset password akun admin Anda di sistem <strong>Cherry Field Residence</strong>.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetLink}" 
                                style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                                Reset Password Sekarang
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">
                            Atau salin dan tempel tautan ini di browser Anda:<br>
                            <a href="${resetLink}" style="word-break: break-all; color: #3b82f6;">${resetLink}</a>
                        </p>
                        
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                            <p style="font-size: 14px; color: #666;">
                                <strong>Catatan penting:</strong>
                                <br>• Tautan ini akan kedaluwarsa dalam 1 jam
                                <br>• Jika Anda tidak meminta reset password, abaikan email ini
                                <br>• Untuk keamanan, jangan bagikan tautan ini kepada siapapun
                            </p>
                        </div>
                        
                        <p style="margin-top: 30px; color: #666;">
                            Salam,<br>
                            <strong>Tim Cherry Field Residence</strong>
                        </p>
                    </div>
                </div>
            `,
        };

        // Kirim email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ 
            message: "Jika email terdaftar, tautan untuk reset password telah dikirim." 
        });

    } catch (error) {
        console.error("Forgot Password Error: ", error);
        return res.status(500).json({ message: "Terjadi kesalahan server. Silakan coba lagi." });
    }
};

// Reset Password - Update password dengan token untuk Admin
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const secret = process.env.SECRET_KEY;

    try {
        // Validasi input
        if (!token || !password) {
            return res.status(400).json({ message: "Token dan password baru harus diisi" });
        }

        if (password.length < 8) {
            return res.status(400).json({ message: "Password minimal 8 karakter" });
        }

        // Verifikasi token
        const decoded = jwt.verify(token, secret);
        
        // Pastikan user masih ada dan masih admin
        const user = await prisma.user.findUnique({ 
            where: { id: decoded.id } 
        });

        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Token tidak valid untuk admin" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Access denied: Akun telah dinonaktifkan" });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update password
        await prisma.user.update({
            where: { id: decoded.id },
            data: { password: hashedPassword },
        });

        return res.status(200).json({ 
            message: "Password berhasil diubah. Silakan login dengan password baru Anda." 
        });

    } catch (error) {
        console.error("Reset Password Error: ", error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: "Token telah kedaluwarsa. Silakan minta reset password ulang." });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: "Token tidak valid" });
        }

        return res.status(500).json({ message: "Terjadi kesalahan server. Silakan coba lagi." });
    }
};

module.exports = { adminLogin, logout, userDetails, forgotPassword, resetPassword };
