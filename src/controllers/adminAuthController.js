const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
dotenv.config();

app.use(express.json());

const secret = process.env.SECRET_KEY;

// Login Admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({ where: { email } });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Jika password belum di-set
        if (!user.password) {
            return res.status(400).json({ message: 'Password not set' });
        }

        // Cek password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Buat token JWT
        const token = jwt.sign(
            { id: user.id, role: "admin" },
            process.env.SECRET_KEY,
            { expiresIn: "7d" }
        );

        return res.status(200).json({
            token,
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
            },
            message: 'Login successful'
        });

    } catch (error) {
        console.error("Login Error: ", error); // ✅ Log error di terminal
        return res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { loginAdmin };
