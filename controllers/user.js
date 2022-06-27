const asyncHandler = require('../middlewares/async');

exports.test = asyncHandler(async (req, res, next) => {
  res.json({ message: 'test done!' });
});
