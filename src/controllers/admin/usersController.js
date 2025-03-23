const { PrismaClient } = require('@prisma/client');
const express = require('express');
const bcrypt = require('bcrypt');
const app = express();  
const joi  = require('joi');

const prisma = new PrismaClient();
app.use(express.json());


const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
});

const users = async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany({
            where: {
                role: "penghuni"
            }
        });
        res.status(200).json({data: allUsers });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const createUser = async (req, res) => {
    const { email, password } = req.body;
    // Validasi input
    const { error } = userSchema.validate({ email, password });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    try {
        // Cek apakah email sudah ada
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Simpan user baru
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: "User created successfully", data: user });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ message: "Email already in use" });
        }
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = {users, createUser}