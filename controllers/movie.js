const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../cloud');
const Movie = require('../models/movie');
const { isValidObjectId } = require('mongoose');
const { uploadImageToCloudinary } = require('../utils/imageUpload');

exports.uploadTrailer = asyncHandler(async (req, res, next) => {
  const { file } = req;

  if (!file) return next(new ErrorResponse('No file uploaded', 400));

  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file?.path,
    {
      resource_type: 'video',
    }
  );

  res.status(201).json({ url, public_id });
});

exports.createMovie = asyncHandler(async (req, res, next) => {
  const {
    file,
    body: {
      title,
      storyLine,
      director,
      releaseDate,
      status,
      type,
      genres,
      tags,
      cast,
      writers,
      trailer,
      language,
    },
  } = req;

  const newMovie = new Movie({
    title,
    storyLine,
    releaseDate,
    status,
    type,
    genres,
    tags,
    cast,
    trailer,
    language,
  });

  if (director) {
    if (!isValidObjectId(director))
      return next(new ErrorResponse('Invalid director id', 400));

    newMovie.director = director;
  }

  if (writers) {
    for (const writer of writers) {
      if (!isValidObjectId(writer))
        return next(new ErrorResponse('Invalid writer id', 400));
    }

    newMovie.writers = writers;
  }

  // uploading poster
  const {
    secure_url: url,
    public_id,
    responsive_breakpoints,
  } = await cloudinary.uploader.upload(file?.path, {
    transformation: {
      width: 1280,
      height: 720,
    },
    responsive_breakpoints: {
      create_derived: true,
      max_width: 640,
      max_images: 3,
    },
  });

  const finalPoster = { url, public_id, responsive: [] };

  const { breakpoints } = responsive_breakpoints[0];

  if (breakpoints.length) {
    for (const imgObj of breakpoints) {
      const { secure_url } = imgObj;
      finalPoster.responsive.push(secure_url);
    }
  }

  newMovie.poster = finalPoster;

  await newMovie.save();

  res.status(201).json({
    success: true,
    id: newMovie._id,
    title,
  });
});
