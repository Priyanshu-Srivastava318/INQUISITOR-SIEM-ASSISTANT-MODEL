  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const morgan = require('morgan');
  const compression = require('compression');
  const rateLimit = require('express-rate-limit');
  const path = require('path');
  require('dotenv').config();

  // ===== FIXED PATHS =====
  const { sequelize, testConnection } = require(path.join(__dirname, 'config', 'database'));
  const elasticsearchService = require(path.join(__dirname, 'services', 'elasticsearch'));

  // ===== ROUTES =====
  const authRoutes = require(path.join(__dirname, 'routes', 'auth'));
  const threatRoutes = require(path.join(__dirname, 'routes', 'threats'));
  const chatRoutes = require(path.join(__dirname, 'routes', 'chat'));

  // ===== APP INIT =====
  const app = express();

  // ===== SECURITY =====
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // ===== RATE LIMIT =====
  const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
    message: 'Too many requests from this IP'
  });
  app.use('/api/', limiter);

  // ===== BODY PARSER =====
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ===== COMPRESSION =====
  app.use(compression());

  // ===== LOGGING =====
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // ===== HEALTH CHECK =====
  app.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'INQUISITOR Backend is running',
      timestamp: new Date().toISOString()
    });
  });

  // ===== API ROUTES =====
  app.use('/api/auth', authRoutes);
  app.use('/api/threats', threatRoutes);
  app.use('/api/chat', chatRoutes);

  // ===== 404 HANDLER =====
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  // ===== ERROR HANDLER =====
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });

  // ===== SERVER START =====
  const PORT = process.env.PORT || 5000;

  const startServer = async () => {
    try {
      // DB connect
      await testConnection();

      // Sync models
      await sequelize.sync({ alter: false });
      console.log('✅ Database models synced');

      // Default admin
      await createDefaultAdmin();

      // Elasticsearch
      const esConnected = await elasticsearchService.testConnection();
      if (!esConnected) {
        console.warn('⚠️ Elasticsearch not connected - fallback enabled');
      }

      // Listen
      app.listen(PORT, () => {
        console.log(`🚀 INQUISITOR Backend running on port ${PORT}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };

  // ===== DEFAULT ADMIN =====
  async function createDefaultAdmin() {
    const User = require(path.join(__dirname, 'models', 'User'));

    try {
      const adminExists = await User.findOne({
        where: { email: 'admin@inquisitor.ai' }
      });

      if (!adminExists) {
        await User.create({
          name: 'Admin User',
          email: 'admin@inquisitor.ai',
          password: 'admin123',
          role: 'Administrator'
        });
        console.log('✅ Default admin user created');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  }

  // ===== GRACEFUL SHUTDOWN =====
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await sequelize.close();
    await elasticsearchService.close();
    console.log('✅ Connections closed');
    process.exit(0);
  });

  // ===== START =====
  startServer();

  module.exports = app;
    