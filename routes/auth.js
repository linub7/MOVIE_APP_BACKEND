const express = require('express');
const { signup, signin } = require('../controllers/auth');
const {
  signupValidators,
  signinValidators,
  authValidator,
} = require('../middlewares/authValidator');

const router = express.Router();

router.post('/signup', signupValidators, authValidator, signup);
router.post('/signin', signinValidators, authValidator, signin);

module.exports = router;
