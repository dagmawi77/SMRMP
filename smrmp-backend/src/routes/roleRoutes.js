const express = require('express');
const {
  listRoles,
  listPermissions,
  createRole,
  updateRole,
  deleteRole,
  assignPermissions,
  createRoleValidation,
  updateRoleValidation,
  assignPermissionsValidation,
} = require('../controllers/roleController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionGuard');

const router = express.Router();

router.use(protect);

router.get('/permissions', requirePermission('roles.read'), listPermissions);
router.get('/', requirePermission('roles.read'), listRoles);
router.post('/', requirePermission('roles.create'), createRoleValidation, createRole);
router.patch('/:id', requirePermission('roles.update'), updateRoleValidation, updateRole);
router.delete('/:id', requirePermission('roles.delete'), deleteRole);
router.put(
  '/:id/permissions',
  requirePermission('roles.assign_permissions'),
  assignPermissionsValidation,
  assignPermissions
);

module.exports = router;
