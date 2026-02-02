const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Process chat query
router.post('/query', (req, res) => chatController.processQuery(req, res));

module.exports = router;