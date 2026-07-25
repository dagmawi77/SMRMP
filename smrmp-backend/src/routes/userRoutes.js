const express = require('express');
const {
  listUsers,
  createStaffUser,
  updateUser,
  updateUserStatus,
  createUserValidation,
  updateUserValidation,
  statusValidation,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);

router.get('/', requirePermission('users.read'), listUsers);
router.post('/', requirePermission('users.create'), createUserValidation, createStaffUser);
router.patch('/:id', requirePermission('users.update'), updateUserValidation, updateUser);
router.patch(
  '/:id/status',
  requirePermission('users.deactivate'),
  statusValidation,
  updateUserStatus
);

module.exports = router;
