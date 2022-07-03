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
      ref: 'Actor',
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
        type: {
          type: ObjectId,
          ref: 'Actor',
        },
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

module.exports = mongoose.model('Movie', movieSchema);
