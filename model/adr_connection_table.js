const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrConnectionTable = dbConnection.define('adr_connection_table', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  created_dt: Sequelize.DATE(6),
  created_by: Sequelize.STRING,
  modified_dt: Sequelize.DATE(6),
  modified_by: Sequelize.STRING,
  client_id: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_connection_table'
});

module.exports = adrConnectionTable;