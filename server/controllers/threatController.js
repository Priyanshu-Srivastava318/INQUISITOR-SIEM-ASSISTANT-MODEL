const Threat = require('../models/Threat');
const elasticsearchService = require('../services/elasticsearch');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');

// @desc    Get all active threats
// @route   GET /api/threats
// @access  Private
exports.getThreats = async (req, res) => {
  try {
    const { status, severity, hours = 24, limit = 100 } = req.query;

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (severity) {
      where.severity = severity;
    }

    // Get threats from last X hours
    const timeAgo = new Date(Date.now() - hours * 3600000);
    where.detectedAt = { [Op.gte]: timeAgo };

    const threats = await Threat.findAll({
      where,
      limit: parseInt(limit),
      order: [['detectedAt', 'DESC']]
    });

    res.json({
      success: true,
      count: threats.length,
      threats
    });
  } catch (error) {
    console.error('Get threats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching threats'
    });
  }
};

// @desc    Get threat statistics
// @route   GET /api/threats/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const timeAgo = new Date(Date.now() - hours * 3600000);

    // Get counts by severity
    const severityCounts = await Threat.findAll({
      attributes: [
        'severity',
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        detectedAt: { [Op.gte]: timeAgo }
      },
      group: ['severity']
    });

    // Get counts by status
    const statusCounts = await Threat.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        detectedAt: { [Op.gte]: timeAgo }
      },
      group: ['status']
    });

    // Get top source IPs
    const topIPs = await Threat.findAll({
      attributes: [
        'sourceIp',
        [fn('COUNT', col('id')), 'count']
      ],
      where: {
        detectedAt: { [Op.gte]: timeAgo }
      },
      group: ['sourceIp'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 10
    });

    // Get Elasticsearch stats if available
    let siemStats = null;
    try {
      siemStats = await elasticsearchService.getStatistics(hours);
    } catch (error) {
      console.log('Elasticsearch not available, using database stats only');
    }

    res.json({
      success: true,
      stats: {
        severityCounts,
        statusCounts,
        topIPs,
        siemStats,
        timeframe: `${hours}h`
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};

// @desc    Block IP address
// @route   POST /api/threats/:id/block
// @access  Private
exports.blockIP = async (req, res) => {
  try {
    const threat = await Threat.findByPk(req.params.id);

    if (!threat) {
      return res.status(404).json({
        success: false,
        message: 'Threat not found'
      });
    }

    threat.blocked = true;
    threat.status = 'Blocked';
    await threat.save();

    // TODO: Integrate with firewall API to actually block the IP

    res.json({
      success: true,
      message: `IP ${threat.sourceIp} blocked successfully`,
      threat
    });
  } catch (error) {
    console.error('Block IP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking IP'
    });
  }
};

// @desc    Resolve threat
// @route   POST /api/threats/:id/resolve
// @access  Private
exports.resolveThreat = async (req, res) => {
  try {
    const { notes } = req.body;
    const threat = await Threat.findByPk(req.params.id);

    if (!threat) {
      return res.status(404).json({
        success: false,
        message: 'Threat not found'
      });
    }

    threat.status = 'Resolved';
    threat.resolvedAt = new Date();
    
    if (notes) {
      threat.details = {
        ...threat.details,
        resolutionNotes: notes,
        resolvedBy: req.user.id
      };
    }

    await threat.save();

    res.json({
      success: true,
      message: 'Threat resolved successfully',
      threat
    });
  } catch (error) {
    console.error('Resolve threat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving threat'
    });
  }
};

// @desc    Sync threats from SIEM
// @route   POST /api/threats/sync
// @access  Private (Admin only)
exports.syncThreats = async (req, res) => {
  try {
    const { hours = 1 } = req.body;

    // Get threats from Elasticsearch
    const siemThreats = await elasticsearchService.getThreats(hours);

    let syncedCount = 0;

    for (const siemThreat of siemThreats) {
      // Check if threat already exists
      const existing = await Threat.findOne({
        where: { siemEventId: siemThreat.id }
      });

      if (!existing) {
        await Threat.create({
          threatType: siemThreat['event.action'] || 'Unknown',
          severity: siemThreat['event.severity'] || 'Medium',
          sourceIp: siemThreat['source.ip'],
          targetIp: siemThreat['destination.ip'],
          targetPort: siemThreat['destination.port'],
          country: siemThreat['source.geo.country_name'],
          detectedAt: new Date(siemThreat.timestamp),
          siemEventId: siemThreat.id,
          details: siemThreat
        });
        syncedCount++;
      }
    }

    res.json({
      success: true,
      message: `Synced ${syncedCount} new threats from SIEM`,
      totalProcessed: siemThreats.length
    });
  } catch (error) {
    console.error('Sync threats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error syncing threats from SIEM'
    });
  }
};