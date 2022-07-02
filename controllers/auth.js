const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const PasswordResetToken = require('../models/passwordResetToken');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');
const { isValidObjectId } = require('mongoose');
const sendEmail = require('../utils/sendMail');
const generateOTP = require('../utils/generateOTP');
const generatePasswordResetToken = require('../utils/generatePasswordResetToken');

exports.signup = asyncHandler(async (req, res, next) => {
  const {
    body: { name, email, password },
  } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const user = await User.create({ name, email, password });

  const token = generateOTP();

  const newEmailVerificationToken = await EmailVerificationToken.create({
    owner: user._id,
    token,
  });

  const options = {
    email: email,
    subject: 'Email Verification',
    message: `<div style=" max-width: 700px; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-family: Roboto; font-weight: 600; color: #191a19; "> <span>Verification Token</span></div><div style=" padding: 1rem 0; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; color: #141823; font-size: 17px; font-family: Roboto; "> <span>Hello ${email}</span> <div style=" padding: 10px 15px; background: #171816; color: #fff; text-decoration: none; font-weight: 600; " > <p>This is your Verification Token</p> <h1>${token}</h1> </div> <br /></div>`,
  };

  await sendEmail(options);

  sendTokenResponse(user, 200, res);
  // return res.status(201).json({
  //   _id: user._id,
  //   name: user.name,
  //   email: user.email,
  // });
});

exports.signin = asyncHandler(async (req, res, next) => {
  const {
    body: { email, password },
  } = req;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check for user
  const user = await User.findOne({
    email,
  }).select('+password');
  if (!user) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  // Check if password match
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid Credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const {
    body: { OTP, userId },
  } = req;

  console.log(userId);

  if (!isValidObjectId(userId)) {
    return next(new ErrorResponse('User not Found', 400));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not Found', 400));
  }
  if (user.isVerified) {
    return next(new ErrorResponse('User already verified', 400));
  }

  const emailVerificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  console.log(emailVerificationToken);

  if (!emailVerificationToken) {
    return next(new ErrorResponse('Token not Found', 400));
  }

  const matched = await emailVerificationToken.matchToken(OTP);
  console.log(matched);

  if (!matched) {
    return next(new ErrorResponse('Invalid OTP', 400));
  }
  user.isVerified = true;
  await user.save();
  await emailVerificationToken.remove();

  sendTokenResponse(user, 200, res);
});

exports.resendEmailVerification = asyncHandler(async (req, res, next) => {
  const {
    body: { userId },
  } = req;

  if (!isValidObjectId(userId)) {
    return next(new ErrorResponse('User not Found', 400));
  }
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not Found', 400));
  }
  if (user.isVerified) {
    return next(new ErrorResponse('User already verified', 400));
  }

  const existToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (existToken) {
    return next(
      new ErrorResponse(
        'Only after 1 hour you can request for another token',
        400
      )
    );
  }

  const token = generateOTP();

  const newEmailVerificationToken = await EmailVerificationToken.create({
    owner: user._id,
    token,
  });

  const options = {
    email: user.email,
    subject: 'Re-send Email Verification',
    message: `<div style=" max-width: 700px; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-family: Roboto; font-weight: 600; color: #191a19; "> <span>Verification Token</span></div><div style=" padding: 1rem 0; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; color: #141823; font-size: 17px; font-family: Roboto; "> <span>Hello ${user.email}</span> <div style=" padding: 10px 15px; background: #171816; color: #fff; text-decoration: none; font-weight: 600; " > <p>re-sended Token:</p> <h1>${token}</h1> </div> <br /></div>`,
  };

  await sendEmail(options);

  return res.status(201).json({
    message:
      'OTP TOKEN has been re-sent to your email. Please verify your account until expiry.',
  });
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const {
    body: { email },
  } = req;

  if (!email) {
    return next(new ErrorResponse('Email is required', 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('User not Found', 404));
  }

  const existPasswordResetToken = await PasswordResetToken.findOne({
    owner: user._id,
  });

  if (existPasswordResetToken) {
    return next(
      new ErrorResponse(
        'Only after 1 hour you can request for another token',
        400
      )
    );
  }

  const token = generatePasswordResetToken();
  const newPasswordResetToken = await PasswordResetToken.create({
    owner: user._id,
    token,
  });

  const resetPasswordUrl = `http://localhost:3000/auth/reset-password?token=${token}&id=${user._id}`;

  const options = {
    email: user.email,
    subject: 'Reset Password Link',
    message: `<div style=" max-width: 700px; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; font-family: Roboto; font-weight: 600; color: #191a19; "> <span>Reset Password Link</span></div><div style=" padding: 1rem 0; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; color: #141823; font-size: 17px; font-family: Roboto; "> <span>Hello ${user.email}</span> <div style=" padding: 10px 15px; background: #171816; color: #fff; text-decoration: none; font-weight: 600; " > <p>Click here to reset Password</p> <a href=${resetPasswordUrl}>Change Password</a> </div> <br /></div>`,
  };

  await sendEmail(options);

  return res.json({ message: 'Link sent to your email' });
});

exports.isValidToken = asyncHandler(async (req, res, next) => {
  const {
    body: { token, id },
  } = req;

  if (!token || !isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  const passwordResetToken = await PasswordResetToken.findOne({
    owner: id,
  });

  if (!passwordResetToken) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  const matchedToken = await passwordResetToken.matchToken(token);

  if (!matchedToken) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  return res.status(200).json({ verify: true, message: 'Token is valid' });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const {
    body: { password, token, id },
  } = req;

  if (!token || !isValidObjectId(id)) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  const passwordResetToken = await PasswordResetToken.findOne({
    owner: id,
  });

  if (!passwordResetToken) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  const matchedToken = await passwordResetToken.matchToken(token);

  if (!matchedToken) {
    return next(new ErrorResponse('Invalid Token', 400));
  }

  if (!password || password.length < 6) {
    return next(
      new ErrorResponse(
        'Password is required & password length must be at least 6 character',
        400
      )
    );
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorResponse('User not Found', 400));
  }

  user.password = password;

  await user.save();

  await passwordResetToken.remove();

  return res.status(200).json({
    message: 'Password Changed Successfully',
  });
});

exports.getMe = asyncHandler(async (req, res, next) => {
  const {
    user: { _id },
  } = req;
  console.log(_id);

  const user = await User.findById(_id);

  if (!user) {
    return next(new ErrorResponse('User not Found', 400));
  }

  sendTokenResponse(user, 200, res);
});

// Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const { _id, name, email, isVerified, role } = user;
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    _id,
    name,
    email,
    isVerified,
    role,
  });
};
