require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const path = require('path');

// Import models and associations
const User = require('./models/User');
const Computer = require('./models/Computer');
const { Request, setupAssociations: setupRequestAssociations } = require('./models/Request');
const { Log, setupAssociations: setupLogAssociations } = require('./models/Log');
const createTestData = require(path.join(__dirname, 'seeders', 'testData'));

// Set up associations
setupLogAssociations();
setupRequestAssociations();

// Import routes
const authRoutes = require('./routes/auth');
const logsRoutes = require('./routes/logs');
const computerRoutes = require('./routes/computer');
const requestRoutes = require('./routes/request');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Test database connection and sync
sequelize.authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
        // Sync database with alter option
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('Database synchronized and tables created.');
        // Create test data
        return createTestData();
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/computers', computerRoutes);
app.use('/api/requests', requestRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        details: err
    });
    
    res.status(500).json({
        error: 'Something broke!',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 