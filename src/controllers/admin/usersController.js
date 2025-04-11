const { PrismaClient } = require("@prisma/client");
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const joi = require("joi");
const {createClient} = require('@supabase/supabase-js')
const dotenv = require("dotenv");
dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const prisma = new PrismaClient();
app.use(express.json());

const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
    phone: joi
        .string()   
        .pattern(/^[0-9]+$/)
        .min(10)
        .max(15),
    nomor_rumah: joi.string(),
    rt: joi.string(),
    rw: joi.string(),
    cluster: joi.string().valid("ChairaTownHouse", "GrandCeleste", "Calosa"),
});

const users = async (req, res) => {
    try {
        const allUsers = await prisma.user.findMany({
        where: {
            role: "penghuni",
        },
    });
    res.status(200).json({ data: allUsers });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};

// Membuat user
const createUser = async (req, res) => {
    const { email, password, phone, nomor_rumah, rt, rw, cluster } = req.body;
    // Validasi input
    const { error } = userSchema.validate({ email, password, phone, nomor_rumah, rt, rw, cluster });
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
            phone,
            nomor_rumah,
            rt,
            rw,
            cluster,
            password: hashedPassword,
        },
    });
    const response = await supabase.channel("all_changes").send({
        type: "broadcast",
        event: "user",
        payload: user,
    });
    res.status(201).json({ message: "User created successfully", data: user });
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(400).json({ message: "Email already in use" });
        }
    res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
};

// detail user
const detail = async (req, res) => {
    try {
        const {user_id} = req.params;
        const user = await prisma.user.findUnique({
            where: { id: user_id }
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
        res.status(200).json({ message: "success", data: verifikasi});
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

module.exports = { users, createUser, verifikasiUser, detail}