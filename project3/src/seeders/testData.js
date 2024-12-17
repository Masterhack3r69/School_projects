const User = require('../models/User');
const Computer = require('../models/Computer');
const { Request } = require('../models/Request');
const { Log } = require('../models/Log');

const createTestData = async () => {
    try {
        // Create test users
        const admin = await User.create({
            username: 'admin1',
            password: 'admin123',
            role: 'admin'
        });

        const teacher = await User.create({
            username: 'teacher1',
            password: 'teacher123',
            role: 'teacher'
        });

        const students = await Promise.all([
            User.create({
                username: 'student1',
                password: 'student123',
                role: 'student'
            }),
            User.create({
                username: 'student2',
                password: 'student123',
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
        console.log('Admin - username: admin1, password: admin123');
        console.log('Teacher - username: teacher1, password: teacher123');
        console.log('Students - username: student1/student2, password: student123');
        console.log('\nTest Computers:');
        console.log('Lab 1: PC-LAB1-01 (available), PC-LAB1-02 (in-use)');
        console.log('Lab 2: PC-LAB2-01 (available), PC-LAB2-02 (under-maintenance)');

    } catch (error) {
        console.error('Error creating test data:', error);
    }
};

module.exports = createTestData;
