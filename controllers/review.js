const asyncHandler = require('../middlewares/async');
const { isValidObjectId } = require('mongoose');
const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/review');
const Movie = require('../models/movie');

exports.addReview = asyncHandler(async (req, res, next) => {
  const {
    user: { _id },
    body: { parentMovie, rating, content },
  } = req;
  if (!isValidObjectId(parentMovie))
    return next(new ErrorResponse('Movie not Found', 400));
  if (!isValidObjectId(_id))
    return next(new ErrorResponse('Owner not found', 400));

  const movie = await Movie.findById(parentMovie)
    .populate('reviews', 'owner')
    .select('reviews');
  if (!movie) return next(new ErrorResponse('Movie not Found', 400));

  if (
    movie.reviews.some((review) => review.owner.toString() === _id.toString())
  )
    return next(new ErrorResponse('You already reviewed this movie', 400));

  const review = await Review.create({
    owner: _id,
    parentMovie,
    rating,
    content,
  });

  movie.reviews.push(review._id);
  await movie.save();

  return res.status(200).json({ review });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const {
    params: { reviewId },
  } = req;

  const review = await Review.findById(reviewId);
  if (!review) return next(new ErrorResponse('Review not Found', 400));
  return res.status(200).json({ review });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  const {
    user: { _id },
    params: { reviewId },
    body: { rating, content },
  } = req;

  if (!isValidObjectId(reviewId))
    return next(new ErrorResponse('Review not found', 400));

  const review = await Review.findOne({ owner: _id, _id: reviewId });
  if (!review) return next(new ErrorResponse('Review not Found', 400));

  if (!isValidObjectId(review.parentMovie))
    return next(new ErrorResponse('Movie not Found', 400));

  if (!isValidObjectId(_id))
    return next(new ErrorResponse('Owner not found', 400));

  if (review.owner.toString() !== _id.toString())
    return next(new ErrorResponse('Unauthorized', 401));

  review.rating = rating;
  review.content = content;
  await review.save();

  const movie = await Movie.findById(review.parentMovie);

  if (!movie) return next(new ErrorResponse('Movie not Found', 400));

  for (const review of movie.reviews) {
    if (review._id.toString() === reviewId.toString()) {
      movie.reviews.splice(movie.reviews.indexOf(review), 1);
      break;
    }
  }

  movie.reviews.push(review._id);

  await movie.save();
  const reviews = await Review.find({ parentMovie: movie._id }).populate(
    'owner',
    '_id name'
  );

  return res.status(200).json({ message: 'Review updated', review, reviews });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  const {
    user: { _id, role },
    params: { reviewId },
  } = req;
  console.log(reviewId);

  if (!isValidObjectId(reviewId))
    return next(new ErrorResponse('Review not found', 400));

  const review = await Review.findOne({ owner: _id, _id: reviewId });
  if (!review) return next(new ErrorResponse('Review not Found', 400));

  if (!isValidObjectId(review.parentMovie))
    return next(new ErrorResponse('Movie not Found', 400));

  if (!isValidObjectId(_id))
    return next(new ErrorResponse('Owner not found', 400));

  if (review.owner.toString() !== _id.toString() && role !== 'admin')
    return next(new ErrorResponse('Unauthorized', 401));

  await review.remove();

  const movie = await Movie.findById(review.parentMovie);

  if (!movie) return next(new ErrorResponse('Movie not Found', 400));

  for (const review of movie.reviews) {
    if (review.toString() === reviewId.toString()) {
      movie.reviews.splice(movie.reviews.indexOf(review), 1);
      break;
    }
  }

  await movie.save();

  const reviewsCount = await Review.countDocuments({ parentMovie: movie._id });

  return res.status(200).json({ message: 'Review deleted', reviewsCount });
});

exports.getReviewsByMovie = asyncHandler(async (req, res, next) => {
  const {
    params: { movieId },
  } = req;

  if (!isValidObjectId(movieId))
    return next(new ErrorResponse('Movie not found', 400));

  const movie = await Movie.findById(movieId)
    .populate({
      path: 'reviews',
      populate: { path: 'owner', select: 'name' },
      select: 'rating content',
    })
    .select('reviews');
  if (!movie) return next(new ErrorResponse('Movie not Found', 400));

  return res.status(200).json(movie.reviews);
});

exports.getMovieReviewsByUser = asyncHandler(async (req, res, next) => {
  const {
    params: { movieId },
  } = req;

  if (!isValidObjectId(movieId))
    return next(new ErrorResponse('Movie not found', 400));

  const movie = await Movie.findById(movieId)
    .populate({
      path: 'reviews',
      populate: { path: 'owner', select: 'name' },
      select: 'rating content',
    })
    .select('reviews title');
  if (!movie) return next(new ErrorResponse('Movie not Found', 400));

  return res.status(200).json({ reviews: movie.reviews, movie: movie.title });
});
