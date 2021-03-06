const mongoose = require('mongoose');
const genres = require('../utils/genres');

const {
  Schema: {
    Types: { ObjectId },
  },
} = mongoose;

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    storyLine: {
      type: String,
      trim: true,
      required: true,
    },
    director: {
      type: ObjectId,
      ref: 'Director',
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['public', 'private'],
    },
    type: {
      type: String,
      required: true,
    },
    genres: {
      type: [String],
      required: true,
      enum: genres,
    },
    tags: {
      type: [String],
      required: true,
    },
    cast: [
      {
        actor: {
          type: ObjectId,
          ref: 'Actor',
        },
        roleAs: String,
        leadActor: Boolean,
      },
    ],
    writers: [
      {
        type: ObjectId,
        ref: 'Writer',
      },
    ],
    poster: {
      type: Object,
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      responsive: [URL],
      required: true,
    },
    trailer: {
      type: Object,
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      required: true,
    },
    reviews: [{ type: ObjectId, ref: 'Review' }],
    language: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
