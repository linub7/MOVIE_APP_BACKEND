const mongoose = require('mongoose');

const writerSchema = new mongoose.Schema(
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

writerSchema.index({ name: 'text' });

module.exports = mongoose.model('Writer', writerSchema);
