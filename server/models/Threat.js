const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Threat = sequelize.define('Threat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  threatType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'threat_type'
  },
  severity: {
    type: DataTypes.ENUM('Critical', 'High', 'Medium', 'Low'),
    allowNull: false
  },
  sourceIp: {
    type: DataTypes.STRING(45),
    allowNull: false,
    field: 'source_ip'
  },
  targetIp: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'target_ip'
  },
  targetPort: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'target_port'
  },
  status: {
    type: DataTypes.ENUM('Active', 'Investigating', 'Blocked', 'Resolved'),
    defaultValue: 'Active'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  detectedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'detected_at'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  blocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  details: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  siemEventId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'siem_event_id'
  }
}, {
  tableName: 'threats',
  underscored: true,
  indexes: [
    {
      fields: ['source_ip']
    },
    {
      fields: ['detected_at']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Threat;