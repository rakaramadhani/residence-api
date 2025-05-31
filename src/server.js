const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const app = express();

// Import routes
const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
const adminRoutes = require("./routes/admin/adminRoutes");
const userAuthRoutes = require("./routes/penghuni/penghuniAuthRoutes");
const userRoutes = require("./routes/penghuni/penghuniRoutes");

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api", adminAuthRoutes);
app.use("/api", adminRoutes);
app.use("/api", userAuthRoutes);
app.use("/api", userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Residence API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Residence API', 
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;

// Untuk development
if (require.main === module) {
  async function startServer() {
    try {
      const seeder = require("../prisma/seed");
      await seeder();
      
      const { startScheduler } = require('./controllers/admin/tagihanController');
      startScheduler();
      
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Server start error:', error);
    }
  }
  startServer();
}

// Export untuk Vercel
module.exports = app;