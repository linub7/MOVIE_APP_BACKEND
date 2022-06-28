const crypto = require('crypto');

// Generate and hash password token
const getResetPasswordToken = function () {
  // Generate token
  const buffString = crypto.randomBytes(30).toString('hex');
  console.log('buffString', buffString);

  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(buffString)
    .digest('hex');

  console.log('resetPasswordToken', resetPasswordToken);

  return resetPasswordToken;
};

module.exports = getResetPasswordToken;
