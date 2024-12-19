const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
        allowNull: false,
        references: {
            model: 'Computers',
            key: 'id'
        }
    },
    operation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

const setupAssociations = () => {
    const User = require('./User');
    const Computer = require('./Computer');

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