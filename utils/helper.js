const Review = require('../models/review');

exports.parseData = (req, res, next) => {
  const {
    body: { trailer, cast, genres, tags, writers },
  } = req;

  if (trailer) {
    req.body.trailer = JSON.parse(trailer);
  }

  if (cast) {
    req.body.cast = JSON.parse(cast);
  }

  if (genres) {
    req.body.genres = JSON.parse(genres);
  }

  if (tags) {
    req.body.tags = JSON.parse(tags);
  }

  if (writers) {
    req.body.writers = JSON.parse(writers);
  }

  next();
};

exports.averageRatingPipeline = (movieId) => {
  return [
    {
      $lookup: {
        from: 'Review',
        localField: 'rating',
        foreignField: '_id',
        as: 'avgRating',
      },
    },
    {
      $match: {
        parentMovie: movieId,
      },
    },
    {
      $group: {
        _id: null,
        ratingAverage: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ];
};

exports.relatedMoviesPipeline = (movie) => {
  return [
    {
      $lookup: {
        from: 'Movie',
        localField: 'tags',
        foreignField: '_id',
        as: 'relatedMovies',
      },
    },
    {
      $match: {
        tags: { $in: [...movie.tags] },
        _id: { $ne: movie._id },
      },
    },
    {
      $project: {
        title: 1,
        poster: '$poster.url',
        responsivePosters: '$poster.responsive',
      },
    },
    {
      $limit: 5,
    },
  ];
};

exports.getMovieRatingAverage = async (movieId) => {
  const [aggregatedResponse] = await Review.aggregate(
    this.averageRatingPipeline(movieId)
  );
  const reviews = {};

  if (aggregatedResponse) {
    reviews.ratingAverage = parseFloat(
      aggregatedResponse.ratingAverage
    ).toFixed(1);
    reviews.reviewCount = aggregatedResponse.reviewCount;
  }

  return reviews;
};

exports.topRatedMoviesPipeline = (type) => {
  const matchOptions = {
    reviews: {
      $exists: true,
    },
    status: { $eq: 'public' },
  };

  if (type) matchOptions.type = { $eq: type };

  return [
    {
      $lookup: {
        from: 'Movies',
        localField: 'reviews',
        foreignField: '_id',
        as: 'topRated',
      },
    },
    {
      $match: matchOptions,
    },
    {
      $project: {
        title: 1,
        poster: '$poster.url',
        responsivePosters: '$poster.responsive',
        reviewsCount: {
          $size: '$reviews',
        },
      },
    },
    {
      $sort: {
        reviewsCount: -1,
      },
    },
    {
      $limit: 5,
    },
  ];
};
