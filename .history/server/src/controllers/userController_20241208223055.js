// src/controllers/userController.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll({
                attributes: ['id', 'email', 'firstName', 'lastName', 'isActive']
            });
            res.status(200).json(users);
        } catch (error) {
            console.error('getAllUsers error:', error);
            res.status(500).json({ error: error.message });
        }
    },

    register: async (req, res) => {
        try {
            const { email, password, firstName, lastName } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Email and password are required' 
                });
            }

            // Log registration attempt (without sensitive data)
            console.log('Registration attempt for email:', email);

            // Check if user already exists
            const existingUser = await User.findOne({ 
                where: { email },
                attributes: ['id', 'email']
            });

            if (existingUser) {
                console.log('Registration failed: User already exists -', email);
                return res.status(400).json({ 
                    message: 'User already exists' 
                });
            }

            // Create new user with exact field names matching the database
            console.log('Creating new user...');
            const user = await User.create({
                email,
                password,
                firstName,
                lastName,
                isActive: true
            });

            console.log('User created successfully:', user.id);

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send success response
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isActive: user.isActive
                }
            });
        } catch (error) {
            // Detailed error logging
            console.error('Registration error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });

            // Send appropriate error response
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ 
                    error: 'Invalid input data',
                    details: error.errors.map(err => ({
                        field: err.path,
                        message: err.message
                    }))
                });
            }

            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ 
                    error: 'Email already registered' 
                });
            }

            res.status(500).json({ 
                error: 'Registration failed. Please try again.' 
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({ 
                    message: 'Email and password are required' 
                });
            }

            // Find user by email
            const user = await User.findOne({ 
                where: { email },
                attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'isActive']
            });

            if (!user) {
                return res.status(401).json({ 
                    message: 'Invalid credentials' 
                });
            }

            // Validate password
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({ 
                    message: 'Invalid credentials' 
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    id: user.id, 
                    email: user.email 
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(200).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isActive: user.isActive
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                error: 'Login failed. Please try again.' 
            });
        }
    },

    logout: async (req, res) => {
        try {
            res.status(200).json({ 
                message: 'Logged out successfully' 
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ 
                error: 'Logout failed' 
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: ['id', 'email', 'firstName', 'lastName', 'isActive']
            });
            
            if (!user) {
                return res.status(404).json({ 
                    message: 'User not found' 
                });
            }
            
            res.status(200).json(user);
        } catch (error) {
            console.error('getProfile error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch profile' 
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { firstName, lastName, password } = req.body;
            const user = await User.findByPk(req.user.id);
            
            if (!user) {
                return res.status(404).json({ 
                    message: 'User not found' 
                });
            }

            // Update user fields
            if (firstName) user.firstName = firstName;
            if (lastName) user.lastName = lastName;
            if (password) user.password = password;

            await user.save();

            res.status(200).json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive
            });
        } catch (error) {
            console.error('updateProfile error:', error);
            res.status(500).json({ 
                error: 'Failed to update profile' 
            });
        }
    }
};

module.exports = userController;
