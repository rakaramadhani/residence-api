const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const app = express();
const prisma = new PrismaClient();
dotenv.config();

app.use(express.json());




// login user
const login = async (req, res) => {
  const { email, password } = req.body;
  const secret = process.env.SECRET_KEY;
  try {
    // cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role !== "penghuni") {
      return res.status(403).json({ message: "Access denied: Only penghuni can login" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && !role) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
                { id: user.id, role: "penghuni" },
                secret,
                { expiresIn: "1d" }
            );

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

const userDetails = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({ message: "User Details", data: user });
  } catch (error) {
    
  }
}

module.exports = { login, userDetails };
