const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
    createRequest,
    getAllRequests,
    getStudentRequests,
    approveRequest,
    rejectRequest,
    completeRequest
} = require('../controllers/requestController');

// Student routes
router.post('/', auth, checkRole(['student']), createRequest);
router.get('/my-requests', auth, checkRole(['student']), getStudentRequests);
router.patch('/:id/complete', auth, checkRole(['student']), completeRequest);

// Teacher/Admin routes
router.get('/', auth, checkRole(['teacher', 'admin']), getAllRequests);
router.patch('/:id/approve', auth, checkRole(['teacher', 'admin']), approveRequest);
router.patch('/:id/reject', auth, checkRole(['teacher', 'admin']), rejectRequest);

module.exports = router; 