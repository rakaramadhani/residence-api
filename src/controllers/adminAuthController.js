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
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Cek user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied: Only admin can login" });
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
            message: 'Login successful'
        });

    } catch (error) {
        console.error("Login Error: ", error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const userDetails = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User Details", data: user });
    } catch (error) {
        console.error(error); 
        return res.status(500).json({ message: "Server error" });
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


module.exports = { adminLogin, logout, userDetails };
