const express = require('express');
const router = express.Router();
const threatController = require('../controllers/threatController');
const { auth, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get threats
router.get('/', threatController.getThreats);
router.get('/stats', threatController.getStats);

// Threat actions
router.post('/:id/block', authorize('Administrator', 'Analyst'), threatController.blockIP);
router.post('/:id/resolve', authorize('Administrator', 'Analyst'), threatController.resolveThreat);

// Sync from SIEM (Admin only)
router.post('/sync', authorize('Administrator'), threatController.syncThreats);

module.exports = router;    