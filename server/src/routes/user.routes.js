const express = require('express');
const { getAllUsers, getUserById, updateUser, createUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.get('/', authorize('Admin', 'Manager'), getAllUsers);
router.post('/', authorize('Admin'), createUser);
router.get('/:id', authorize('Admin', 'Manager'), getUserById);
router.patch('/:id', authorize('Admin'), updateUser);

module.exports = router;
