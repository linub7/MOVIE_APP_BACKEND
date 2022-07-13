const { isValidObjectId } = require('mongoose');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Director = require('../models/director');
const {
  uploadImageToCloudinary,
  destroyImageFromCloudinary,
} = require('../utils/imageUpload');

exports.createDirector = asyncHandler(async (req, res, next) => {
  const {
    body: { name },
  } = req;

  const newDirector = new Director({ name });
  if (req.file) {
    const { url, public_id } = await uploadImageToCloudinary(req.file?.path);
    newDirector.avatar = { url, public_id };
  }

  await newDirector.save();

  res.status(201).json({
    id: newDirector._id,
    name: newDirector.name,
    avatar: newDirector?.avatar?.url,
  });
});

exports.updateDirector = asyncHandler(async (req, res, next) => {
  const {
    params: { directorId },
    body: { name },
  } = req;

  if (!isValidObjectId(directorId))
    return next(new ErrorResponse('Director Id is not valid', 400));

  const director = await Director.findById(directorId);
  if (!director)
    return next(
      new ErrorResponse(`Director with id ${directorId} not found`, 404)
    );

  const public_id = Director.avatar?.public_id;

  // remove old image if there was one
  if (public_id && req.file) {
    const result = await destroyImageFromCloudinary(public_id);
    if (result !== 'ok')
      return next(new ErrorResponse('Error deleting image', 500));
  }

  // upload new avatar if there is one
  if (req.file) {
    const { url, public_id } = await uploadImageToCloudinary(req.file?.path);
    director.avatar = { url, public_id };
  }

  director.name = name ? name : director.name;

  await director.save();

  res.status(201).json({
    id: director._id,
    name: director.name,
    avatar: director?.avatar?.url,
  });
});

exports.deleteDirector = asyncHandler(async (req, res, next) => {
  const {
    params: { directorId },
  } = req;

  if (!isValidObjectId(directorId))
    return next(new ErrorResponse('Director Id is not valid', 400));

  const director = await Director.findById(directorId);

  if (director.avatar?.url) {
    const result = await destroyImageFromCloudinary(director.avatar?.public_id);
    if (result !== 'ok')
      return next(new ErrorResponse('Error deleting image', 500));
  }

  await director.remove();

  res.status(200).json({
    message: 'Director deleted successfully',
  });
});

exports.searchDirector = asyncHandler(async (req, res, next) => {
  const {
    query: { name },
  } = req;

  const result = await Director.find({ $text: { $search: `"${name}"` } }); // `"${name}"` : extract only query string

  res.json(result);
});

exports.getLatestUploadedDirectors = asyncHandler(async (req, res, next) => {
  const result = await Director.find({}).sort({ createdAt: -1 }).limit(12);

  res.json(result);
});

exports.getSingleDirector = asyncHandler(async (req, res, next) => {
  const {
    params: { directorId },
  } = req;

  if (!isValidObjectId(directorId))
    return next(new ErrorResponse('Director Id is not valid', 400));

  const director = await Director.findById(directorId);

  if (!director)
    return next(
      new ErrorResponse(`Director with id ${directorId} not found`, 404)
    );

  res.json(director);
});

exports.getDirectors = asyncHandler(async (req, res, next) => {
  const {
    query: { pageNo, limit },
  } = req;
  const count = await Director.countDocuments();
  const result = await Director.find({})
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(parseInt(pageNo) * parseInt(limit));

  res.json({ result, count });
});
