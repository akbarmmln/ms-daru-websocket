const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrVerifikasi = dbConnection.define('adr_verifikasi', {
  kk: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  account_id: Sequelize.STRING,
  organitation_id: Sequelize.STRING,
  position_id: Sequelize.STRING,
  is_registered: Sequelize.STRING,
}, {
  freezeTableName: true,
  timestamps: false,
  tableName: 'adr_verifikasi'
});

module.exports = adrVerifikasi;