const express = require('express');
const {
  signup,
  signin,
  verifyEmail,
  resendEmailVerification,
  forgotPassword,
  resetPassword,
  isValidToken,
} = require('../controllers/auth');
const {
  signupValidators,
  signinValidators,
  authValidator,
} = require('../middlewares/authValidator');

const router = express.Router();

router.post('/signup', signupValidators, authValidator, signup);
router.post('/signin', signinValidators, authValidator, signin);
router.post('/verify-email', verifyEmail);
router.post('/is-valid-token', isValidToken);
router.post('/resend-verify-email', resendEmailVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
// router.post('/reset-password', resetPassword);

module.exports = router;
