const { check, validationResult } = require('express-validator');

exports.reviewValidators = [
  check('rating', 'rating must be a number between 1 and 10').isFloat({
    min: 1,
    max: 10,
  }),
  check('content', 'content must be a string').isString(),
];

exports.reviewValidate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.status(400).json({
      error: error.map((error) => error.msg),
    });
  }
  next();
};
