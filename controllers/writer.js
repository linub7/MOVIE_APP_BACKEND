const { isValidObjectId } = require('mongoose');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Writer = require('../models/writer');
const Movie = require('../models/movie');
const {
  uploadImageToCloudinary,
  destroyImageFromCloudinary,
} = require('../utils/imageUpload');

exports.createWriter = asyncHandler(async (req, res, next) => {
  const {
    body: { name },
  } = req;

  const newWriter = new Writer({ name });
  if (req.file) {
    const { url, public_id } = await uploadImageToCloudinary(req.file?.path);
    newWriter.avatar = { url, public_id };
  }

  await newWriter.save();

  res.status(201).json({
    id: newWriter._id,
    name: newWriter.name,
    avatar: newWriter?.avatar?.url,
  });
});

exports.updateWriter = asyncHandler(async (req, res, next) => {
  const {
    params: { writerId },
    body: { name },
  } = req;

  if (!isValidObjectId(writerId))
    return next(new ErrorResponse('Writer Id is not valid', 400));

  const writer = await Writer.findById(writerId);
  if (!writer)
    return next(new ErrorResponse(`Writer with id ${writerId} not found`, 404));

  const public_id = writer.avatar?.public_id;

  // remove old image if there was one
  if (public_id && req.file) {
    const result = await destroyImageFromCloudinary(public_id);
    if (result !== 'ok')
      return next(new ErrorResponse('Error deleting image', 500));
  }

  // upload new avatar if there is one
  if (req.file) {
    const { url, public_id } = await uploadImageToCloudinary(req.file?.path);
    writer.avatar = { url, public_id };
  }

  writer.name = name ? name : writer.name;

  await writer.save();

  res.status(201).json({
    id: writer._id,
    name: writer.name,
    avatar: writer?.avatar?.url,
  });
});

exports.deleteWriter = asyncHandler(async (req, res, next) => {
  const {
    params: { writerId },
  } = req;

  if (!isValidObjectId(writerId))
    return next(new ErrorResponse('Writer Id is not valid', 400));

  const writer = await Writer.findById(writerId);

  if (writer.avatar?.url) {
    const result = await destroyImageFromCloudinary(writer.avatar?.public_id);
    if (result !== 'ok')
      return next(new ErrorResponse('Error deleting image', 500));
  }

  const movies = await Movie.find({ writers: writerId });
  movies.forEach(async (movie) => {
    const writers = movie.writers.filter(
      (writer) => writer.toString() !== writerId
    );
    movie.writers = writers;
    await movie.save();
  });

  await writer.remove();

  res.status(200).json({
    message: 'Writer deleted successfully',
  });
});

exports.searchWriter = asyncHandler(async (req, res, next) => {
  const {
    query: { name },
  } = req;
  if (!name.trim()) return next(new ErrorResponse('Invalid Request', 400));

  // const result = await Writer.find({ $text: { $search: `"${name}"` } }); // `"${name}"` : extract only query string
  const result = await Writer.find({
    name: { $regex: `.*${name}.*`, $options: 'i' },
  });

  res.json(result);
});

exports.getLatestUploadedWriters = asyncHandler(async (req, res, next) => {
  const result = await Writer.find({}).sort({ createdAt: -1 }).limit(12);

  res.json(result);
});

exports.getSingleWriter = asyncHandler(async (req, res, next) => {
  const {
    params: { writerId },
  } = req;

  if (!isValidObjectId(writerId))
    return next(new ErrorResponse('Writer Id is not valid', 400));

  const writer = await Writer.findById(writerId);

  if (!writer)
    return next(new ErrorResponse(`Writer with id ${writerId} not found`, 404));

  res.json(Writer);
});

exports.getWriters = asyncHandler(async (req, res, next) => {
  const {
    query: { pageNo, limit },
  } = req;
  const count = await Writer.countDocuments();
  const result = await Writer.find({})
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(parseInt(pageNo) * parseInt(limit));

  res.json({ result, count });
});
