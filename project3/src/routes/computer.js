const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
    getAllComputers,
    getComputersByLab,
    getAvailableComputers,
    createComputer,
    updateComputerStatus,
    deleteComputer
} = require('../controllers/computerController');

// Public routes
router.get('/available', getAvailableComputers);

// Protected routes - All roles
router.get('/', auth, getAllComputers);
router.get('/lab/:labName', auth, getComputersByLab);

// Protected routes - Teachers/Admins only
router.post('/', auth, checkRole(['teacher', 'admin']), createComputer);
router.put('/:id/status', auth, checkRole(['teacher', 'admin']), updateComputerStatus);
router.delete('/:id', auth, checkRole(['teacher', 'admin']), deleteComputer);

module.exports = router; 