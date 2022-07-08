const mongoose = require('mongoose');

const directorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter name'],
      trim: true,
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

directorSchema.index({ name: 'text' });

module.exports = mongoose.model('Director', directorSchema);
