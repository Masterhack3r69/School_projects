const Computer = require('../models/Computer');
const { Log } = require('../models/Log');

// Get all computers
const getAllComputers = async (req, res) => {
    try {
        const computers = await Computer.findAll();
        res.json(computers);
    } catch (error) {
        console.error('Error in getAllComputers:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get computers by lab
const getComputersByLab = async (req, res) => {
    try {
        const computers = await Computer.findAll({
            where: { lab_name: req.params.labName }
        });
        res.json(computers);
    } catch (error) {
        console.error('Error in getComputersByLab:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get available computers
const getAvailableComputers = async (req, res) => {
    try {
        const computers = await Computer.findAll({
            where: { status: 'available' }
        });
        res.json(computers);
    } catch (error) {
        console.error('Error in getAvailableComputers:', error);
        res.status(500).json({ error: error.message });
    }
};

// Create a new computer
const createComputer = async (req, res) => {
    try {
        const { computer_name, lab_name } = req.body;
        const computer = await Computer.create({
            computer_name,
            lab_name,
            status: 'available'
        });

        // Log the creation
        await Log.create({
            userId: req.user.id,
            computerId: computer.id,
            operation: 'create',
            details: `Computer ${computer_name} added to ${lab_name}`
        });

        res.status(201).json(computer);
    } catch (error) {
        console.error('Error in createComputer:', error);
        res.status(400).json({ error: error.message });
    }
};

// Update computer status
const updateComputerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const computer = await Computer.findByPk(req.params.id);
        
        if (!computer) {
            return res.status(404).json({ error: 'Computer not found' });
        }

        const oldStatus = computer.status;
        await computer.update({ status });

        // Log the status change
        const operation = status === 'under-maintenance' ? 'maintenance-start' : 
                         status === 'available' ? 'maintenance-end' : 
                         status === 'in-use' ? 'computer-login' : 'computer-logout';

        await Log.create({
            userId: req.user.id,
            computerId: computer.id,
            operation,
            details: `Status changed from ${oldStatus} to ${status}`
        });

        res.json(computer);
    } catch (error) {
        console.error('Error in updateComputerStatus:', error);
        res.status(400).json({ error: error.message });
    }
};

// Delete a computer
const deleteComputer = async (req, res) => {
    try {
        const computer = await Computer.findByPk(req.params.id);
        
        if (!computer) {
            return res.status(404).json({ error: 'Computer not found' });
        }

        // Log the deletion
        await Log.create({
            userId: req.user.id,
            computerId: computer.id,
            operation: 'delete',
            details: `Computer ${computer.computer_name} deleted from ${computer.lab_name}`
        });

        await computer.destroy();
        res.json({ message: 'Computer deleted successfully' });
    } catch (error) {
        console.error('Error in deleteComputer:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllComputers,
    getComputersByLab,
    getAvailableComputers,
    createComputer,
    updateComputerStatus,
    deleteComputer
}; 