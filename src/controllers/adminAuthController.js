const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
dotenv.config();

app.use(express.json());


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


module.exports = { adminLogin, logout, userDetails };
