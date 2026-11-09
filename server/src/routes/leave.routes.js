const express = require('express');
const { applyLeave, getMyLeaves, getAllLeaves, reviewLeave } = require('../controllers/leave.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/admin/all', authorize('Admin', 'Manager'), getAllLeaves);
router.patch('/:id/review', authorize('Admin', 'Manager'), reviewLeave);

module.exports = router;
