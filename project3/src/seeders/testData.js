require('dotenv').config();
const User = require('../models/User');
const Computer = require('../models/Computer');
const { Request } = require('../models/Request');
const { Log } = require('../models/Log');
const sequelize = require('../config/database');

const createTestData = async (shouldCloseConnection = false) => {
    try {
        // Initialize database connection
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Check if test data already exists
        const adminExists = await User.findOne({ where: { username: 'admin1' } });
        if (adminExists) {
            console.log('Test data already exists, skipping creation.');
            return;
        }

        // Create test admin and teacher users
        const admin = await User.create({
            username: 'admin1',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User',
            middleInitial: 'A',
            course: 'N/A',
            schoolId: 'ADMIN-0001', // Special format for admin
            role: 'admin'
        });

        const teacher = await User.create({
            username: 'teacher1',
            password: 'teacher123',
            firstName: 'Teacher',
            lastName: 'User',
            middleInitial: 'T',
            course: 'Computer Science',
            schoolId: 'TCHR-0001', // Special format for teacher
            role: 'teacher'
        });

        // Create test student users with valid school IDs
        const currentYear = new Date().getFullYear();
        const students = await Promise.all([
            User.create({
                username: 'student1',
                password: 'student123',
                firstName: 'John',
                lastName: 'Doe',
                middleInitial: 'A',
                course: 'BS Computer Science',
                schoolId: `C-${currentYear}-1234`,
                role: 'student'
            }),
            User.create({
                username: 'student2',
                password: 'student123',
                firstName: 'Jane',
                lastName: 'Smith',
                middleInitial: 'B',
                course: 'BS Information Technology',
                schoolId: `C-${currentYear}-5678`,
                role: 'student'
            })
        ]);

        // Create test computers
        const computers = await Promise.all([
            Computer.create({
                computer_name: 'PC-LAB1-01',
                lab_name: 'Laboratory 1',
                status: 'available'
            }),
            Computer.create({
                computer_name: 'PC-LAB1-02',
                lab_name: 'Laboratory 1',
                status: 'available'
            }),
            Computer.create({
                computer_name: 'PC-LAB2-01',
                lab_name: 'Laboratory 2',
                status: 'available'
            }),
            Computer.create({
                computer_name: 'PC-LAB2-02',
                lab_name: 'Laboratory 2',
                status: 'under-maintenance'
            })
        ]);

        // Create test requests
        const requests = await Promise.all([
            // Pending request
            Request.create({
                studentId: students[0].id,
                computerId: computers[0].id,
                status: 'pending',
                requestedAt: new Date()
            }),
            // Approved request
            Request.create({
                studentId: students[1].id,
                computerId: computers[1].id,
                status: 'approved',
                requestedAt: new Date(Date.now() - 3600000), // 1 hour ago
                processedAt: new Date()
            })
        ]);

        // Update computer status for approved request
        await computers[1].update({ status: 'in-use' });

        // Create some logs
        await Promise.all([
            Log.create({
                userId: admin.id,
                computerId: computers[3].id,
                operation: 'maintenance-start',
                details: 'Regular maintenance check',
                timestamp: new Date(Date.now() - 7200000) // 2 hours ago
            }),
            Log.create({
                userId: students[1].id,
                computerId: computers[1].id,
                operation: 'computer-login',
                details: `Request approved for student ${students[1].id}`,
                timestamp: new Date(Date.now() - 3600000) // 1 hour ago
            })
        ]);

        console.log('Test data created successfully!');
        console.log('\nTest Accounts:');
        console.log('Admin:');
        console.log('  Username: admin1');
        console.log('  Password: admin123');
        console.log('  School ID:', admin.schoolId);
        console.log('\nTeacher:');
        console.log('  Username: teacher1');
        console.log('  Password: teacher123');
        console.log('  School ID:', teacher.schoolId);
        console.log('\nStudents:');
        console.log('1. Username: student1');
        console.log('   Password: student123');
        console.log('   Name: John A. Doe');
        console.log('   Course: BS Computer Science');
        console.log('   School ID:', students[0].schoolId);
        console.log('\n2. Username: student2');
        console.log('   Password: student123');
        console.log('   Name: Jane B. Smith');
        console.log('   Course: BS Information Technology');
        console.log('   School ID:', students[1].schoolId);
        console.log('\nTest Computers:');
        console.log('Lab 1: PC-LAB1-01 (available), PC-LAB1-02 (in-use)');
        console.log('Lab 2: PC-LAB2-01 (available), PC-LAB2-02 (under-maintenance)');

        // Only close the connection if running as a standalone script
        if (shouldCloseConnection) {
            await sequelize.close();
            console.log('\nDatabase connection closed.');
        }

    } catch (error) {
        console.error('Error creating test data:', error);
        // Only close the connection on error if running as a standalone script
        if (shouldCloseConnection) {
            try {
                await sequelize.close();
                console.log('Database connection closed after error.');
            } catch (closeError) {
                console.error('Error closing database connection:', closeError);
            }
        }
        throw error;
    }
};

// Run the function if this script is run directly
if (require.main === module) {
    createTestData(true).catch(error => {
        console.error('Failed to create test data:', error);
        process.exit(1);
    });
}

module.exports = createTestData;
