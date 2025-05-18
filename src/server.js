const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const app = express();
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const userAuthRoutes = require("./routes/penghuni/penghuniAuthRoutes");
const userRoutes = require("./routes/penghuni/penghuniRoutes");
const seeder = require("../prisma/seed");
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

const PORT = process.env.PORT;

async function startServer() {
  // Ambil seeder
  await seeder()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });

  // Mulai scheduler tagihan otomatis
  startScheduler();

  // Port
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
  
startServer();