const Leave = require('../models/Leave');
const User = require('../models/User');

// POST /api/leaves  - Apply for leave
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    // Check for overlapping leave requests
    const overlap = await Leave.findOne({
      userId: req.user._id,
      status: { $ne: 'Rejected' },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlap) {
      return res.status(400).json({ message: 'You already have a leave request overlapping these dates.' });
    }

    const leave = await Leave.create({
      userId: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({ message: 'Leave application submitted.', leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/leaves/my  - Employee's own leaves
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/leaves/admin/all  - Admin/Manager view all leaves
const getAllLeaves = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    // Managers only see leaves for employees in their department
    if (req.user.role === 'Manager') {
      const deptUsers = await User.find({ department: req.user.department }).select('_id');
      const deptUserIds = deptUsers.map((u) => u._id);
      query.userId = userId ? query.userId : { $in: deptUserIds };
    }

    const leaves = await Leave.find(query)
      .populate('userId', 'name email department')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/leaves/:id/review  - Admin/Manager approve or reject
const reviewLeave = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Approved or Rejected.' });
    }

    const leave = await Leave.findById(req.params.id).populate('userId', 'department');
    if (!leave) return res.status(404).json({ message: 'Leave not found.' });
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave already reviewed.' });
    }

    // Manager can only review leaves from their own department
    if (req.user.role === 'Manager' && leave.userId?.department !== req.user.department) {
      return res.status(403).json({ message: 'Access denied. Leave is outside your department.' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNote = reviewNote || '';
    await leave.save();

    res.json({ message: `Leave ${status.toLowerCase()}.`, leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, reviewLeave };
