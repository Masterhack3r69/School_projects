const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const register = async (req, res) => {
    try {
        const { 
            username, 
            password, 
            firstName, 
            lastName, 
            middleInitial, 
            course, 
            schoolId,
            role 
        } = req.body;

        // Always enforce student role for registration
        if (role && role !== 'student') {
            return res.status(403).json({ 
                error: 'Only student registration is allowed through this form. Admin and teacher accounts must be created through the admin panel.' 
            });
        }

        // Validate school ID format
        const schoolIdPattern = /^C-20[2-9][0-9]-\d{4}$/;
        if (!schoolIdPattern.test(schoolId)) {
            return res.status(400).json({ 
                error: 'School ID must follow the format C-20XX-XXXX (e.g., C-2023-1234) where year must be 2022 or later' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            where: { 
                [Op.or]: [
                    { username },
                    { schoolId }
                ]
            } 
        });
        
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            if (existingUser.schoolId === schoolId) {
                return res.status(400).json({ error: 'School ID already registered' });
            }
        }

        // Create new user with enforced student role
        const user = await User.create({
            username,
            password,
            firstName,
            lastName,
            middleInitial,
            course,
            schoolId,
            role: 'student' // Always set role to student
        });

        res.status(201).json({
            message: 'Student registered successfully',
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                course: user.course,
                schoolId: user.schoolId,
                role: user.role
            }
        });
    } catch (error) {
        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: error.errors[0].message 
            });
        }
        
        // Handle unique constraint errors
        if (error.name === 'SequelizeUniqueConstraintError') {
            const field = error.errors[0].path;
            const message = field === 'username' ? 
                'Username already exists' : 
                'School ID already registered';
            return res.status(400).json({ error: message });
        }
        
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.json({
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                course: user.course,
                schoolId: user.schoolId,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                course: user.course,
                schoolId: user.schoolId,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    register,
    login,
    getProfile
}; 