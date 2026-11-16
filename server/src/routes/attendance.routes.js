const express = require('express');
const {
  checkIn,
  checkOut,
  getMyHistory,
  getTodayAttendance,
  getAllAttendance,
  getAttendanceSummary,
  recordCheckIn,
  recordCheckOut,
  getEmployeeAttendance,
} = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Employee self-service routes
router.use(protect);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-history', getMyHistory);
router.get('/today', getTodayAttendance);

// AttendanceManager / Admin: record attendance on behalf of employees
router.post('/record/check-in', authorize('AttendanceManager', 'Admin'), recordCheckIn);
router.post('/record/check-out', authorize('AttendanceManager', 'Admin'), recordCheckOut);
router.get('/record/:userId', authorize('AttendanceManager', 'Admin'), getEmployeeAttendance);

// Admin / Manager / AttendanceManager: view all attendance
router.get('/admin/all', authorize('Admin', 'Manager', 'AttendanceManager'), getAllAttendance);
router.get('/admin/summary', authorize('Admin', 'Manager', 'AttendanceManager'), getAttendanceSummary);

module.exports = router;
