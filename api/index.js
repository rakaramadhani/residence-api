// Simple Vercel Serverless Function
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  // Root endpoint
  if (url === '/' && method === 'GET') {
    return res.json({
      message: 'Residence API',
      version: '1.0.0',
      status: 'Running on Vercel',
      timestamp: new Date().toISOString()
    });
  }

  // Health check
  if (url === '/api/health' && method === 'GET') {
    return res.json({
      status: 'OK',
      message: 'API is running on Vercel',
      timestamp: new Date().toISOString(),
      method,
      url
    });
  }

  // Test endpoint
  if (url === '/api/test' && method === 'GET') {
    return res.json({
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      method,
      url,
      headers: req.headers
    });
  }

  // Admin login endpoint
  if (url === '/api/admin/login' && method === 'POST') {
    try {
      const { email, password } = req.body || {};
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email dan password harus diisi'
        });
      }

      // Simple response for testing
      return res.json({
        message: 'Login endpoint working',
        received: { email, password: '***' },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }

  // 404 for other routes
  return res.status(404).json({
    error: 'Not Found',
    message: `Path ${url} not found`,
    method,
    timestamp: new Date().toISOString()
  });
}; 