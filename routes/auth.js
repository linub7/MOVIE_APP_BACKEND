const express = require('express');
const {
  signup,
  signin,
  verifyEmail,
  resendEmailVerification,
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
router.post('/resend-verify-email', resendEmailVerification);

module.exports = router;
