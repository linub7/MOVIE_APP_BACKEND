const { check, validationResult } = require('express-validator');

exports.writerInfoValidators = [
  check('name').trim().not().isEmpty().withMessage('Writer name is missing!'),
];

exports.writerInfoValidate = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.status(400).json({
      error: error.map((error) => error.msg),
    });
  }
  next();
};
