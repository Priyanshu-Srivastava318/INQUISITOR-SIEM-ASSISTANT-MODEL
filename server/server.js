const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS Configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://inquisitor-siem.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection (Sequelize)
const { sequelize } = require('./config/database');

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models (don't use force: true in production!)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('📊 Database models synced');
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    process.exit(1);
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

// Mount routers
try {
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/logs', require('./routes/logRoutes'));
  app.use('/api/alerts', require('./routes/alertRoutes'));
  app.use('/api/dashboard', require('./routes/dashboardRoutes'));
} catch (error) {
  console.log('⚠️  Some routes not found:', error.message);
}

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
    database: 'PostgreSQL + Sequelize'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    status: 'error',
    message: 'Route not found' 
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