const { Request } = require('../models/Request');
const Computer = require('../models/Computer');
const User = require('../models/User');
const { Log } = require('../models/Log');

// Create a new request
const createRequest = async (req, res) => {
    try {
        const { computerId } = req.body;
        const studentId = req.user.id;

        // Check if computer exists and is available
        const computer = await Computer.findByPk(computerId);
        if (!computer) {
            return res.status(404).json({ error: 'Computer not found' });
        }
        if (computer.status !== 'available') {
            return res.status(400).json({ error: 'Computer is not available' });
        }

        // Check if student has any pending or approved requests
        const existingRequest = await Request.findOne({
            where: {
                studentId,
                status: ['pending', 'approved']
            }
        });
        if (existingRequest) {
            return res.status(400).json({ error: 'You already have an active request' });
        }

        const request = await Request.create({
            studentId,
            computerId,
            status: 'pending',
            requestedAt: new Date()
        });

        res.status(201).json(request);
    } catch (error) {
        console.error('Error in createRequest:', error);
        res.status(400).json({ error: error.message });
    }
};

// Get all requests (for teachers/admins)
const getAllRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            include: [
                {
                    model: User,
                    as: 'Student',
                    attributes: ['username']
                },
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name', 'lab_name']
                }
            ],
            order: [['requestedAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        console.error('Error in getAllRequests:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get student's requests
const getStudentRequests = async (req, res) => {
    try {
        const requests = await Request.findAll({
            where: { studentId: req.user.id },
            include: [
                {
                    model: Computer,
                    as: 'Computer',
                    attributes: ['computer_name', 'lab_name']
                }
            ],
            order: [['requestedAt', 'DESC']]
        });
        res.json(requests);
    } catch (error) {
        console.error('Error in getStudentRequests:', error);
        res.status(500).json({ error: error.message });
    }
};

// Approve a request
const approveRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id, {
            include: [
                {
                    model: Computer,
                    as: 'Computer'
                }
            ]
        });

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request cannot be approved' });
        }

        // Update computer status
        await request.Computer.update({ status: 'in-use' });

        // Update request
        await request.update({
            status: 'approved',
            processedAt: new Date()
        });

        // Create log entry
        await Log.create({
            userId: req.user.id,
            computerId: request.computerId,
            operation: 'computer-login',
            details: `Request approved for student ${request.studentId}`
        });

        res.json(request);
    } catch (error) {
        console.error('Error in approveRequest:', error);
        res.status(400).json({ error: error.message });
    }
};

// Reject a request
const rejectRequest = async (req, res) => {
    try {
        const { reason } = req.body;
        const request = await Request.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request cannot be rejected' });
        }

        await request.update({
            status: 'rejected',
            processedAt: new Date(),
            rejectionReason: reason
        });

        res.json(request);
    } catch (error) {
        console.error('Error in rejectRequest:', error);
        res.status(400).json({ error: error.message });
    }
};

// Complete a request (student finished using computer)
const completeRequest = async (req, res) => {
    try {
        const request = await Request.findByPk(req.params.id, {
            include: [
                {
                    model: Computer,
                    as: 'Computer'
                }
            ]
        });

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        if (request.status !== 'approved') {
            return res.status(400).json({ error: 'Request is not in approved state' });
        }

        // Update computer status
        await request.Computer.update({ status: 'available' });

        // Update request
        await request.update({
            status: 'completed',
            processedAt: new Date()
        });

        // Create log entry
        await Log.create({
            userId: req.user.id,
            computerId: request.computerId,
            operation: 'computer-logout',
            details: `Session completed by student ${request.studentId}`
        });

        res.json(request);
    } catch (error) {
        console.error('Error in completeRequest:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createRequest,
    getAllRequests,
    getStudentRequests,
    approveRequest,
    rejectRequest,
    completeRequest
}; 