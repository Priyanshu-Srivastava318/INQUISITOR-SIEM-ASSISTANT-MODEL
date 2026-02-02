const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Incident = sequelize.define('Incident', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  incidentId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('Critical', 'High', 'Medium', 'Low'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Open', 'Investigating', 'Resolved', 'Closed'),
    defaultValue: 'Open'
  },
  sourceIp: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  targetSystem: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'incidents',
  hooks: {
    beforeCreate: (incident) => {
      if (!incident.incidentId) {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        incident.incidentId = `INC-${year}-${random}`;
      }
    }
  }
});

module.exports = Incident;