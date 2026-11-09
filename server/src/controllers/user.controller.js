const User = require('../models/User');
const crypto = require('crypto');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendWelcomeEmail } = require('../services/email.service');

// GET /api/users  - Admin/Manager
const getAllUsers = async (req, res) => {
    try {
        const { department, role, isActive } = req.query;
        const query = {};

        // Managers are scoped to their own department
        if (req.user.role === 'Manager') {
            query.department = req.user.department;
        } else if (department) {
            query.department = department;
        }

        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const users = await User.find(query).select('-__v').sort({ name: 1 });
        res.json({ users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-__v');
        if (!user) return res.status(404).json({ message: 'User not found.' });

        // Manager can only view users in their department
        if (req.user.role === 'Manager' && user.department !== req.user.department) {
            return res.status(403).json({ message: 'Access denied. User is outside your department.' });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /api/users/:id  - Admin only
const updateUser = async (req, res) => {
    try {
        const { name, department, role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, department, role, isActive },
            { new: true, runValidators: true }
        ).select('-__v');

        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ message: 'User updated.', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/users  - Admin only
const createUser = async (req, res) => {
    try {
        const { name, email, role, department } = req.body;

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered.' });

        // Create user without password — they will set it via email link
        const user = await User.create({ name, email, role, department, passwordSet: false });

        // Generate secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await PasswordResetToken.create({ userId: user._id, token: rawToken, expiresAt });

        // Build setup link
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const setupLink = `${clientUrl}/set-password?token=${rawToken}`;

        // Send welcome email (non-blocking — don't fail user creation if email fails)
        try {
            await sendWelcomeEmail({ to: email, name, setupLink });
        } catch (emailErr) {
            console.error('⚠️  Welcome email failed:', emailErr.message, emailErr.code || '');
        }

        res.status(201).json({
            message: 'User created. A password setup email has been sent.',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, isActive: user.isActive },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, createUser };
