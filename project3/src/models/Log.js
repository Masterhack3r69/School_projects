const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Computer = require('./Computer');

const Log = sequelize.define('Log', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    computerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Computers',
            key: 'id'
        }
    },
    operation: {
        type: DataTypes.ENUM(
            'computer-login',
            'computer-logout',
            'maintenance-start',
            'maintenance-end',
            'create',
            'delete'
        ),
        allowNull: false
    },
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

// Define associations
const setupAssociations = () => {
    Log.belongsTo(User, {
        foreignKey: 'userId',
        as: 'User'
    });
    
    Log.belongsTo(Computer, {
        foreignKey: 'computerId',
        as: 'Computer'
    });
};

module.exports = {
    Log,
    setupAssociations
}; 