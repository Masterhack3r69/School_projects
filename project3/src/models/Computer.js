const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Computer = sequelize.define('Computer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    computer_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    lab_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('available', 'in-use', 'under-maintenance'),
        allowNull: false,
        defaultValue: 'available'
    }
});

module.exports = Computer; 