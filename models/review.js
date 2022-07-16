const mongoose = require('mongoose');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const reviewSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    parentMovie: {
      type: ObjectId,
      ref: 'Movie',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must be at most 5'],
    },
    content: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
