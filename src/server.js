const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const app = express();
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const userAuthRoutes = require("./routes/penghuni/penghuniAuthRoutes");
const userRoutes = require("./routes/penghuni/penghuniRoutes");

// Import scheduler tagihan
const { startScheduler } = require('./controllers/admin/tagihanController');

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.use(express.json())
app.use(cors())

app.use("/api", adminAuthRoutes);
app.use("/api", adminRoutes);
app.use("/api", userAuthRoutes);
app.use("/api", userRoutes);

const PORT = process.env.PORT || 3000;

// Untuk Vercel, kita perlu export app
if (process.env.NODE_ENV === 'production') {
  // Di production (Vercel), jalankan scheduler saat startup
  startScheduler();
  module.exports = app;
} else {
  // Di development, jalankan server seperti biasa
  async function startServer() {
    const seeder = require("../prisma/seed");
    
    await seeder()
      .catch((e) => {
        console.error(e);
        process.exit(1);
      })
      .finally(async () => {
        await prisma.$disconnect();
      });

    startScheduler();
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }
  
  startServer();
}