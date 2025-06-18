const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
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

// Fungsi untuk menjalankan ngrok
function startNgrok() {
  try {
    const ngrokBatPath = path.join(__dirname, '..', 'ngrokRunBackend.bat');
    console.log('🚀 Starting ngrok tunnel...');
    
    const ngrokProcess = spawn('cmd', ['/c', ngrokBatPath], {
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..')  // Set working directory to project root
    });

    ngrokProcess.stdout.on('data', (data) => {
      console.log(`[NGROK] ${data.toString().trim()}`);
    });

    ngrokProcess.stderr.on('data', (data) => {
      console.error(`[NGROK ERROR] ${data.toString().trim()}`);
    });

    ngrokProcess.on('close', (code) => {
      console.log(`[NGROK] Process exited with code ${code}`);
    });

    ngrokProcess.on('error', (error) => {
      console.error('[NGROK ERROR] Failed to start ngrok:', error.message);
    });

    console.log('✅ Ngrok tunnel started successfully');
    console.log('🌐 Public URL: https://credible-promptly-shiner.ngrok-free.app');
    
  } catch (error) {
    console.error('[NGROK ERROR] Failed to start ngrok:', error.message);
  }
}

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
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    
    // Tunggu 2 detik untuk memastikan server fully started, lalu jalankan ngrok (opsional)
    if (process.env.AUTO_START_NGROK !== 'false') {
      setTimeout(() => {
        startNgrok();
      }, 2000);
    } else {
      console.log('💡 Ngrok auto-start disabled. Set AUTO_START_NGROK=true to enable.');
    }
  });
}

startServer();