const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const emailVerificationTokenSchema = new mongoose.Schema({
  owner: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 3600,
    default: Date.now(),
  },
});

// Encrypt password using bcrypt
emailVerificationTokenSchema.pre('save', async function (next) {
  if (!this.isModified('token')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.token = await bcrypt.hash(this.token, salt);
});

// Match Token
emailVerificationTokenSchema.methods.matchToken = async function (
  enteredToken
) {
  return await bcrypt.compare(enteredToken, this.token);
};

module.exports = mongoose.model(
  'EmailVerificationToken',
  emailVerificationTokenSchema
);
