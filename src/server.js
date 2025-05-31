const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Logging middleware untuk debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint (paling atas untuk testing)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Residence API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    nodeVersion: process.version
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Residence API', 
    version: '1.0.0',
    status: 'Running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint sederhana
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

// Import dan setup routes dengan error handling
try {
  console.log('Loading routes...');
  
  const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
  const adminRoutes = require("./routes/admin/adminRoutes");
  const userAuthRoutes = require("./routes/penghuni/penghuniAuthRoutes");
  const userRoutes = require("./routes/penghuni/penghuniRoutes");

  console.log('Routes loaded successfully');

  // Setup routes
  app.use("/api", adminAuthRoutes);
  app.use("/api", adminRoutes);
  app.use("/api", userAuthRoutes);
  app.use("/api", userRoutes);

  console.log('Routes configured successfully');

} catch (error) {
  console.error('Error loading routes:', error);
  
  // Fallback route jika ada error loading routes
  app.get('/api/admin/login', (req, res) => {
    res.status(500).json({
      error: 'Route loading failed',
      message: error.message,
      stack: error.stack
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Path not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl,
    method: req.method,
    message: 'The requested endpoint was not found',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;

// Untuk development
if (require.main === module) {
  async function startServer() {
    try {
      console.log('Starting development server...');
      
      const seeder = require("../prisma/seed");
      await seeder();
      console.log('Database seeded');
      
      const { startScheduler } = require('./controllers/admin/tagihanController');
      startScheduler();
      console.log('Scheduler started');
      
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('Server start error:', error);
    }
  }
  startServer();
} else {
  console.log('Running in production mode (Vercel)');
  
  // Start scheduler for production
  try {
    const { startScheduler } = require('./controllers/admin/tagihanController');
    startScheduler();
    console.log('Production scheduler started');
  } catch (error) {
    console.error('Scheduler error:', error);
  }
}

// Export untuk Vercel
module.exports = app;