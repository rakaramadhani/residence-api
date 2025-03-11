const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
dotenv.config();

app.use(express.json());

const secret = process.env.SECRET_KEY;

// login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // cek password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });

        // Send response
        return res.json({ token, message: 'Login successful' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { loginUser };
