const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  updatePassword,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  updatePasswordValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/update-password', protect, updatePasswordValidation, updatePassword);

module.exports = router;
