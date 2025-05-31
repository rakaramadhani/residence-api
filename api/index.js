const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');

const app = express();

// Import routes
const adminAuthRoutes = require("../src/routes/admin/adminAuthRoutes");
const adminRoutes = require("../src/routes/admin/adminRoutes");
const userAuthRoutes = require("../src/routes/penghuni/penghuniAuthRoutes");
const userRoutes = require("../src/routes/penghuni/penghuniRoutes");

// Import scheduler tagihan
const { startScheduler } = require('../src/controllers/admin/tagihanController');

app.use(express.json());
app.use(cors());

// Routes
app.use("/api", adminAuthRoutes);
app.use("/api", adminRoutes);
app.use("/api", userAuthRoutes);
app.use("/api", userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Residence API is running on Vercel' 
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Residence API', 
    version: '1.0.0',
    endpoints: [
      'POST /api/admin/login',
      'POST /api/login',
      'GET /api/health'
    ]
  });
});

// Start scheduler for production
if (process.env.NODE_ENV === 'production') {
  try {
    startScheduler();
  } catch (error) {
    console.error('Scheduler error:', error);
  }
}

// Export for Vercel
module.exports = app; 