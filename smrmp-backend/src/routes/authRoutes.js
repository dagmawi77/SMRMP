const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  changePassword,
  registerValidation,
  loginValidation,
  changePasswordValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePasswordValidation, changePassword);

module.exports = router;
