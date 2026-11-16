const User = require('../models/User');

// Predefined default password assigned to every newly created user.
// The user logs in with this and should change it afterwards.
// Override via the DEFAULT_EMPLOYEE_PASSWORD env variable if needed.
const DEFAULT_PASSWORD = process.env.DEFAULT_EMPLOYEE_PASSWORD || 'Employee@123';

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

    // Assign the predefined default password so the employee can log in
    // immediately using their email + this password. passwordSet stays false
    // until the employee sets their own password.
    const user = await User.create({
      name,
      email,
      role,
      department,
      password: DEFAULT_PASSWORD,
      passwordSet: false,
    });

    res.status(201).json({
      message: 'User created with the default password. Instruct the employee to log in and change it.',
      defaultPassword: DEFAULT_PASSWORD,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
        passwordSet: user.passwordSet,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUser, createUser };
