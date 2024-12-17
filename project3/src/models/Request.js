const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Computer = require('./Computer');

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    computerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Computers',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
    },
    requestedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    processedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Define associations
const setupAssociations = () => {
    Request.belongsTo(User, {
        foreignKey: 'studentId',
        as: 'Student'
    });
    
    Request.belongsTo(Computer, {
        foreignKey: 'computerId',
        as: 'Computer'
    });
};

module.exports = {
    Request,
    setupAssociations
}; 