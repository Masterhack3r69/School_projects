const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'First Name is required'
            }
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Last Name is required'
            }
        }
    },
    middleInitial: {
        type: DataTypes.STRING(1),
        allowNull: true,
        validate: {
            len: {
                args: [0, 1],
                msg: 'Middle Initial must be a single character'
            }
        }
    },
    course: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Course is required'
            }
        }
    },
    schoolId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
            msg: 'This School ID is already registered'
        },
        validate: {
            isValidSchoolId(value) {
                // Allow special formats for admin and teacher
                if (this.role === 'admin' && /^ADMIN-\d{4}$/.test(value)) return;
                if (this.role === 'teacher' && /^TCHR-\d{4}$/.test(value)) return;
                
                // Student school ID validation
                const schoolIdPattern = /^C-20[2-9][0-9]-\d{4}$/;
                if (!schoolIdPattern.test(value)) {
                    throw new Error('School ID must follow the format C-20XX-XXXX where XX is 22 or later');
                }
                
                // Extract year from school ID for student validation
                const year = parseInt(value.substring(2, 6));
                const currentYear = new Date().getFullYear();
                
                if (year < 2022) {
                    throw new Error('School ID year must be 2022 or later');
                }
                if (year > currentYear + 1) {
                    throw new Error('School ID year cannot be more than one year in the future');
                }
            }
        }
    },
    role: {
        type: DataTypes.ENUM('teacher', 'admin', 'student'),
        allowNull: false,
        defaultValue: 'student',
        validate: {
            isIn: {
                args: [['teacher', 'admin', 'student']],
                msg: 'Invalid role specified'
            }
        }
    }
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10);
            }
        }
    }
});

User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = User; 