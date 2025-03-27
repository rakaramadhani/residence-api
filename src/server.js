const express = require('express');
const { createServer } = require('@vercel/node'); // Import handler untuk Vercel
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const adminAuthRoutes = require("../src/routes/admin/adminAuthRoutes");
const adminRoutes = require("../src/routes/admin/adminRoutes");
const userAuthRoutes = require("../src/routes/penghuni/penghuniAuthRoutes");
const userRoutes = require("../src/routes/penghuni/penghuniRoutes");
const seeder = require("../prisma/seed");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", adminAuthRoutes);
app.use("/api", adminRoutes);
app.use("/api", userAuthRoutes);
app.use("/api", userRoutes);

async function initializeSeeder() {
  try {
    await seeder();
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ error: "Internal Server Error" });
  });
// Jalankan seeder sebelum menerima request
initializeSeeder();

module.exports = createServer(app); // Ekspor server untuk Vercel