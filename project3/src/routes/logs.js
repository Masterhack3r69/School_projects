const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
    getAllLogs,
    createLog,
    getLogsByUser,
    getLogsByComputer
} = require('../controllers/logsController');

// Protected routes - Teachers/Admins only
router.get('/', auth, checkRole(['teacher', 'admin']), getAllLogs);
router.get('/user/:userId', auth, checkRole(['teacher', 'admin']), getLogsByUser);
router.get('/computer/:computerId', auth, checkRole(['teacher', 'admin']), getLogsByComputer);

// Protected routes - System only (internal use)
router.post('/', auth, createLog);

module.exports = router; 