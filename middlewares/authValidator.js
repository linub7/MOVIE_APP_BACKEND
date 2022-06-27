const { check, validationResult } = require('express-validator');
exports.signupValidators = [
  check('name').trim().not().isEmpty().withMessage('Please Provide a name'),
  check('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please Provide a valid email'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage(
      'Please Provide a password - Password length must be at least 6 characters'
    ),
];

exports.signinValidators = [
  check('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please Provide a valid email'),
  check('password')
    .trim()
    .not()
    .isEmpty()
    .isLength({ min: 6, max: 20 })
    .withMessage(
      'Please Provide a password - Password length must be at least 6 characters & must be less than 20 characters'
    ),
];

exports.authValidator = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.status(400).json({
      error: error.map((error) => error.msg),
    });
  }
  next();
};
