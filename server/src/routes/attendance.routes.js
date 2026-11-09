const express = require('express');
const {
    checkIn,
    checkOut,
    getMyHistory,
    getTodayAttendance,
    getAllAttendance,
    getAttendanceSummary,
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Employee routes
router.use(protect);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-history', getMyHistory);
router.get('/today', getTodayAttendance);

// Admin/Manager only
router.get('/admin/all', authorize('Admin', 'Manager'), getAllAttendance);
router.get('/admin/summary', authorize('Admin', 'Manager'), getAttendanceSummary);

module.exports = router;
