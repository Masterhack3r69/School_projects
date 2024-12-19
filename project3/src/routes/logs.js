const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const { Log } = require('../models/Log');
const User = require('../models/User');
const Computer = require('../models/Computer');

// Protected routes - Teachers/Admins only
router.get('/', auth, checkRole(['teacher', 'admin']), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: logs } = await Log.findAndCountAll({
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['username', 'firstName', 'lastName']
                },
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name', 'lab_name']
                }
            ],
            order: [['timestamp', 'DESC']],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            logs,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: count,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
});

// Get logs by user
router.get('/user/:userId', auth, checkRole(['teacher', 'admin']), async (req, res) => {
    try {
        const logs = await Log.findAll({
            where: { userId: req.params.userId },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['username', 'firstName', 'lastName']
                },
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name', 'lab_name']
                }
            ],
            order: [['timestamp', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user logs' });
    }
});

// Get logs by computer
router.get('/computer/:computerId', auth, checkRole(['teacher', 'admin']), async (req, res) => {
    try {
        const logs = await Log.findAll({
            where: { computerId: req.params.computerId },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['username', 'firstName', 'lastName']
                },
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name', 'lab_name']
                }
            ],
            order: [['timestamp', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch computer logs' });
    }
});

// Create log entry
router.post('/', auth, async (req, res) => {
    try {
        const log = await Log.create(req.body);
        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create log entry' });
    }
});

module.exports = router; 