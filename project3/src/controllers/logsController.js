const { Log } = require('../models/Log');
const User = require('../models/User');
const Computer = require('../models/Computer');

// Get all logs
const getAllLogs = async (req, res) => {
    try {
        const logs = await Log.findAll({
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['username']
                },
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name']
                }
            ],
            order: [['timestamp', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error('Error in getAllLogs:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new log entry
const createLog = async (req, res) => {
    try {
        const { userId, computerId, operation, details } = req.body;
        const log = await Log.create({
            userId,
            computerId,
            operation,
            details,
            timestamp: new Date()
        });
        res.status(201).json(log);
    } catch (error) {
        console.error('Error in createLog:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get logs by user
const getLogsByUser = async (req, res) => {
    try {
        const logs = await Log.findAll({
            where: { userId: req.params.userId },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['username']
                },
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name']
                }
            ],
            order: [['timestamp', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error('Error in getLogsByUser:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get logs by computer
const getLogsByComputer = async (req, res) => {
    try {
        const logs = await Log.findAll({
            where: { computerId: req.params.computerId },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['username']
                },
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name']
                }
            ],
            order: [['timestamp', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        console.error('Error in getLogsByComputer:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllLogs,
    createLog,
    getLogsByUser,
    getLogsByComputer
}; 