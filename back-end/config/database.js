const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('saas_askmeanything_db', 'saas_askmeanything', 'mariaandmarkosbffe', {
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;