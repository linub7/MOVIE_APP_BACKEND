const mongoose = require('mongoose');

const actorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter name'],
      trim: true,
    },
    about: {
      type: String,
      trim: true,
      required: [true, 'Please enter about'],
    },
    gender: {
      type: String,
      required: [true, 'Please enter gender'],
      enum: ['male', 'female'],
      default: 'male',
    },
    avatar: {
      type: Object,
      url: String,
      public_id: String,
    },
  },
  {
    timestamps: true,
  }
);

actorSchema.index({ name: 'text' });

module.exports = mongoose.model('Actor', actorSchema);
