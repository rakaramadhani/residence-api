// Simple Vercel Serverless Function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  // Parse body for POST requests
  let body = {};
  if (method === 'POST' && req.body) {
    body = req.body;
  } else if (method === 'POST') {
    // Manual body parsing if needed
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString();
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch (error) {
      body = {};
    }
  }

  // Root endpoint
  if (url === '/' && method === 'GET') {
    return res.status(200).json({
      message: 'Residence API',
      version: '1.0.0',
      status: 'Running on Vercel',
      timestamp: new Date().toISOString(),
      success: true
    });
  }

  // Health check
  if (url === '/api/health' && method === 'GET') {
    return res.status(200).json({
      status: 'OK',
      message: 'API is running on Vercel',
      timestamp: new Date().toISOString(),
      method,
      url,
      success: true
    });
  }

  // Test endpoint
  if (url === '/api/test' && method === 'GET') {
    return res.status(200).json({
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      method,
      url,
      success: true
    });
  }

  // Admin login endpoint
  if (url === '/api/admin/login' && method === 'POST') {
    try {
      const { email, password } = body;
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password harus diisi',
          timestamp: new Date().toISOString()
        });
      }

      // Simple response for testing (nanti akan diganti dengan logic sebenarnya)
      return res.status(200).json({
        success: true,
        message: 'Login endpoint working - Basic test',
        data: {
          email: email,
          password: '***hidden***'
        },
        timestamp: new Date().toISOString(),
        note: 'This is a basic test response. Real authentication will be implemented next.'
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 404 for other routes
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Path ${url} not found`,
    method,
    timestamp: new Date().toISOString()
  });
}; 