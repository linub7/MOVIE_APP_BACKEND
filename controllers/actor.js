const { isValidObjectId } = require('mongoose');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const Actor = require('../models/actor');
const Movie = require('../models/movie');
const {
  uploadImageToCloudinary,
  destroyImageFromCloudinary,
} = require('../utils/imageUpload');

exports.createActor = asyncHandler(async (req, res, next) => {
  const {
    body: { name, about, gender },
  } = req;

  const newActor = new Actor({ name, about, gender });
  if (req.file) {
    const { url, public_id } = await uploadImageToCloudinary(req.file?.path);
    newActor.avatar = { url, public_id };
  }

  await newActor.save();

  res.status(201).json({
    id: newActor._id,
    name: newActor.name,
    about: newActor.about,
    gender: newActor.gender,
    avatar: newActor?.avatar?.url,
  });
});

exports.updateActor = asyncHandler(async (req, res, next) => {
  const {
    params: { actorId },
    body: { name, about, gender },
  } = req;

  if (!isValidObjectId(actorId))
    return next(new ErrorResponse('Actor Id is not valid', 400));

  const actor = await Actor.findById(actorId);
  if (!actor)
    return next(new ErrorResponse(`Actor with id ${actorId} not found`, 404));

  const public_id = actor.avatar?.public_id;

  // remove old image if there was one
  if (public_id && req.file) {
    const result = await destroyImageFromCloudinary(public_id);
    if (result !== 'ok')
      return next(new ErrorResponse('Error deleting image', 500));
  }

  // upload new avatar if there is one
  if (req.file) {
    const { url, public_id } = await uploadImageToCloudinary(req.file?.path);
    actor.avatar = { url, public_id };
  }

  actor.name = name ? name : actor.name;
  actor.about = about ? about : actor.about;
  actor.gender = gender ? gender : actor.gender;

  await actor.save();

  res.status(201).json({
    id: actor._id,
    name: actor.name,
    about: actor.about,
    gender: actor.gender,
    avatar: actor?.avatar?.url,
  });
});

exports.deleteActor = asyncHandler(async (req, res, next) => {
  const {
    params: { actorId },
  } = req;

  if (!isValidObjectId(actorId))
    return next(new ErrorResponse('Actor Id is not valid', 400));

  const actor = await Actor.findById(actorId);

  if (actor.avatar?.url) {
    const result = await destroyImageFromCloudinary(actor.avatar?.public_id);
    if (result !== 'ok')
      return next(new ErrorResponse('Error deleting image', 500));
  }

  const movies = await Movie.find({ 'cast.actor': actorId });
  movies.forEach(async (movie) => {
    const cast = movie.cast.filter(
      (castMember) => castMember.actor.toString() !== actorId
    );
    movie.cast = cast;
    await movie.save();
  });

  await actor.remove();

  res.status(200).json({
    message: 'Actor deleted successfully',
  });
});

exports.searchActor = asyncHandler(async (req, res, next) => {
  const {
    query: { name },
  } = req;

  if (!name.trim()) return next(new ErrorResponse('Invalid Request', 400));

  // const result = await Actor.find({ $text: { $search: `"${name}"` } }); // `"${name}"` : extract only query string
  const result = await Actor.find({
    name: { $regex: `.*${name}.*`, $options: 'i' },
  });

  res.json(result);
});

exports.getLatestUploadedActors = asyncHandler(async (req, res, next) => {
  const result = await Actor.find({}).sort({ createdAt: -1 }).limit(12);

  res.json(result);
});

exports.getSingleActor = asyncHandler(async (req, res, next) => {
  const {
    params: { actorId },
  } = req;

  if (!isValidObjectId(actorId))
    return next(new ErrorResponse('Actor Id is not valid', 400));

  const actor = await Actor.findById(actorId);

  if (!actor)
    return next(new ErrorResponse(`Actor with id ${actorId} not found`, 404));

  res.json(actor);
});

exports.getActors = asyncHandler(async (req, res, next) => {
  const {
    query: { pageNo, limit },
  } = req;
  const count = await Actor.countDocuments();
  const result = await Actor.find({})
    .sort('-createdAt')
    .limit(parseInt(limit))
    .skip(parseInt(pageNo) * parseInt(limit));

  res.json({ result, count });
});

exports.testActor = asyncHandler(async (req, res, next) => {
  const {
    params: { actorId },
  } = req;

  const movies = await Movie.find({ 'cast.actor': actorId });

  res.json(movies);
});
