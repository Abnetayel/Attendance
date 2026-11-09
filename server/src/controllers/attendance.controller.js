const Attendance = require('../models/Attendance');

// Helper: today's date string YYYY-MM-DD in local time
const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

// POST /api/attendance/check-in
const checkIn = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = getTodayDate();
        const now = new Date();

        // Prevent duplicate check-in
        const existing = await Attendance.findOne({ userId, date: today });
        if (existing) {
            return res.status(400).json({ message: 'Already checked in for today.' });
        }

        // Determine status: Late if past 09:00 AM
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isLate = hours > 9 || (hours === 9 && minutes > 0);

        const attendance = await Attendance.create({
            userId,
            date: today,
            checkInTime: now,
            status: isLate ? 'Late' : 'Present',
            notes: req.body.notes || '',
        });

        res.status(201).json({ message: 'Checked in successfully.', attendance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /api/attendance/check-out
const checkOut = async (req, res) => {
    try {
        const userId = req.user._id;
        const today = getTodayDate();
        const now = new Date();

        const attendance = await Attendance.findOne({ userId, date: today });
        if (!attendance) {
            return res.status(400).json({ message: 'No check-in record found for today.' });
        }
        if (attendance.checkOutTime) {
            return res.status(400).json({ message: 'Already checked out for today.' });
        }

        // Calculate total hours
        const diffMs = now - new Date(attendance.checkInTime);
        const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

        // Mark Half-Day if less than 4 hours
        let status = attendance.status;
        if (totalHours < 4) {
            status = 'Half-Day';
        }

        attendance.checkOutTime = now;
        attendance.totalHours = totalHours;
        attendance.status = status;
        await attendance.save();

        res.json({ message: 'Checked out successfully.', attendance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/my-history
const getMyHistory = async (req, res) => {
    try {
        const { startDate, endDate, page = 1, limit = 30 } = req.query;
        const query = { userId: req.user._id };

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [records, total] = await Promise.all([
            Attendance.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
            Attendance.countDocuments(query),
        ]);

        res.json({ records, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/today
const getTodayAttendance = async (req, res) => {
    try {
        const today = getTodayDate();
        const record = await Attendance.findOne({ userId: req.user._id, date: today });
        res.json({ record });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/admin/all  (Admin/Manager only)
const getAllAttendance = async (req, res) => {
    try {
        const { date, startDate, endDate, department, userId, page = 1, limit = 50 } = req.query;

        // Build attendance query
        const query = {};
        if (date) query.date = date;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }
        if (userId) query.userId = userId;

        // Build user filter — managers locked to their department
        const userFilter = { isActive: true };
        if (req.user.role === 'Manager') {
            userFilter.department = req.user.department;
        } else if (department) {
            userFilter.department = department;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [records, total] = await Promise.all([
            Attendance.find(query)
                .populate({ path: 'userId', match: userFilter, select: 'name email department role' })
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Attendance.countDocuments(query),
        ]);

        const filtered = records.filter((r) => r.userId !== null);

        res.json({ records: filtered, total, page: parseInt(page), pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /api/attendance/admin/summary  (Admin/Manager only)
const getAttendanceSummary = async (req, res) => {
    try {
        const today = getTodayDate();

        // If Manager, scope to their department's user IDs
        let userIdFilter = null;
        if (req.user.role === 'Manager') {
            const User = require('../models/User');
            const deptUsers = await User.find({ department: req.user.department, isActive: true }).select('_id');
            userIdFilter = deptUsers.map((u) => u._id);
        }

        const baseQuery = (status) => {
            const q = { date: today, status };
            if (userIdFilter) q.userId = { $in: userIdFilter };
            return q;
        };

        const [present, late, halfDay, absent] = await Promise.all([
            Attendance.countDocuments(baseQuery('Present')),
            Attendance.countDocuments(baseQuery('Late')),
            Attendance.countDocuments(baseQuery('Half-Day')),
            Attendance.countDocuments(baseQuery('Absent')),
        ]);

        res.json({ date: today, present, late, halfDay, absent, total: present + late + halfDay + absent });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { checkIn, checkOut, getMyHistory, getTodayAttendance, getAllAttendance, getAttendanceSummary };
