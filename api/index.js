// Vercel Serverless Function
const express = require('express');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running on Vercel',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Residence API',
    version: '1.0.0',
    status: 'Running on Vercel',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Simple admin login endpoint untuk testing
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email dan password harus diisi'
      });
    }

    // Import controller di dalam function
    const { adminLogin } = require('../src/controllers/adminAuthController');
    
    // Call original controller
    await adminLogin(req, res);
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Catch all handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Path ${req.originalUrl} not found`,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel
module.exports = app; 