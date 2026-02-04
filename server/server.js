const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Trust proxy - IMPORTANT for Render/Heroku
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS Configuration - ENHANCED
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://inquisitor-siem.netlify.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection (Sequelize)
const { sequelize, testConnection } = require('./config/database');

// Test database connection
const connectDB = async () => {
  const isConnected = await testConnection();
  
  if (isConnected && process.env.NODE_ENV === 'development') {
    try {
      await sequelize.sync({ alter: false });
      console.log('📊 Database models synced');
    } catch (error) {
      console.log('⚠️  Model sync skipped:', error.message);
    }
  }
};

connectDB();

// Elasticsearch connection (optional)
const connectElasticsearch = async () => {
  try {
    if (process.env.ELASTICSEARCH_NODE) {
      const { Client } = require('@elastic/elasticsearch');
      const esClient = new Client({
        node: process.env.ELASTICSEARCH_NODE
      });
      
      const health = await esClient.cluster.health();
      console.log('✅ Elasticsearch connected:', health.status);
    } else {
      console.log('⚠️  Elasticsearch not configured - fallback enabled');
    }
  } catch (error) {
    console.log('⚠️  Elasticsearch connection failed - fallback enabled');
  }
};

connectElasticsearch();

// Mount routers - CORRECT FILE NAMES
const loadRoute = (routePath, mountPath) => {
  try {
    const fullPath = path.join(__dirname, routePath);
    if (fs.existsSync(fullPath)) {
      app.use(mountPath, require(routePath));
      console.log(`✅ Loaded route: ${mountPath}`);
    } else {
      console.log(`⚠️  Route not found: ${routePath}`);
    }
  } catch (error) {
    console.log(`⚠️  Could not load route ${mountPath}:`, error.message);
  }
};

// Load your actual route files - WITH .js EXTENSION
loadRoute('./routes/auth.js', '/api/auth');
loadRoute('./routes/chat.js', '/api/chat');
loadRoute('./routes/threats.js', '/api/threats');

// Health check route
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ 
      status: 'OK', 
      message: 'INQUISITOR Backend running',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'INQUISITOR SIEM API',
    version: '1.0.0',
    status: 'running',
    database: 'PostgreSQL + Sequelize',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      chat: '/api/chat',
      threats: '/api/threats'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 INQUISITOR Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, closing server gracefully');
  server.close(() => {
    sequelize.close();
    console.log('💤 Process terminated');
  });
});