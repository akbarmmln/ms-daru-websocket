const Sequelize = require('sequelize');
const dbConnection = require('../config/db').Sequelize;

const adrAccountModel = (partition) => {
	return dbConnection.define(`adr_account_${partition}`, {
		id: {
			type: Sequelize.STRING,
			primaryKey: true
		},
		created_dt: Sequelize.DATE(6),
		created_by: Sequelize.STRING,
		modified_dt: Sequelize.DATE(6),
		modified_by: Sequelize.STRING,
		is_deleted: Sequelize.INTEGER,
		nama: Sequelize.STRING,
		kk: Sequelize.STRING,
		mobile_number: Sequelize.STRING,
		email: Sequelize.STRING,
		alamat: Sequelize.STRING,
		blok: Sequelize.STRING,
		nomor_rumah: Sequelize.STRING,
		rt: Sequelize.STRING,
		rw: Sequelize.STRING,
	}, {
		freezeTableName: true,
		timestamps: false,
		tableName: `adr_account_${partition}`,	
	});
};

module.exports = adrAccountModel