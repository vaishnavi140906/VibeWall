const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { isConfigured: isCloudinaryConfigured } = require('./config/cloudinary');
const { ensureDefaultCircles } = require('./controllers/circleController');
const { initSocket } = require('./socket');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const circleRoutes = require('./routes/circleRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global API rate limiting
app.use('/api', apiLimiter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'VibeWall Community API',
    version: '1.0.0',
    status: 'online',
    frontend: process.env.CLIENT_URL || 'http://localhost:5173',
    health: '/api/health'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'VibeWall Community API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    cloudinaryConfigured: isCloudinaryConfigured
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/search', searchRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDB().then(() => {
    ensureDefaultCircles();
    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 VibeWall API Server listening on port ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌐 CORS allowed origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
      console.log(`☁️ Cloudinary: ${isCloudinaryConfigured ? 'Configured & Active' : 'Not configured (Text posts active)'}`);
      console.log(`======================================================\n`);
    });
  });
}

module.exports = { app, server };
