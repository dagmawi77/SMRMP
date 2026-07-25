const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  createUserValidation,
  updateUserValidation,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleGuard');

const router = express.Router();

// All user management routes require authentication and admin role
router.use(protect, isAdmin);

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', createUserValidation, createUser);
router.put('/:id', updateUserValidation, updateUser);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
