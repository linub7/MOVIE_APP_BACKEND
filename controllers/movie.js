const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../cloud');
const Movie = require('../models/movie');
const Review = require('../models/review');
const User = require('../models/user');
const { isValidObjectId } = require('mongoose');
const {
  uploadImageToCloudinary,
  destroyImageFromCloudinary,
} = require('../utils/imageUpload');
const {
  averageRatingPipeline,
  relatedMoviesPipeline,
  getMovieRatingAverage,
  topRatedMoviesPipeline,
} = require('../utils/helper');

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
  if (file) {
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
  }

  await newMovie.save();

  res.status(201).json({
    success: true,
    id: newMovie._id,
    title,
  });
});

exports.updateMovieWithoutPoster = asyncHandler(async (req, res, next) => {
  const {
    params: { movieId },
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

  if (!isValidObjectId(movieId))
    return next(new ErrorResponse('Invalid movie id', 400));

  const movie = await Movie.findById(movieId);

  if (!movie) return next(new ErrorResponse('Movie not found', 404));

  movie.title = title;
  movie.storyLine = storyLine;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.tags = tags;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director))
      return next(new ErrorResponse('Invalid director id', 400));

    movie.director = director;
  }

  if (writers) {
    for (const writer of writers) {
      if (!isValidObjectId(writer))
        return next(new ErrorResponse('Invalid writer id', 400));
    }

    movie.writers = writers;
  }

  await movie.save();

  res.json({
    message: 'Movie is updated successfully',
    movie,
  });
});

exports.updateMovieWithPoster = asyncHandler(async (req, res, next) => {
  const {
    params: { movieId },
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

  if (!isValidObjectId(movieId))
    return next(new ErrorResponse('Invalid movie id', 400));

  if (!req.file) return next(new ErrorResponse('No file uploaded', 400));

  const movie = await Movie.findById(movieId);

  if (!movie) return next(new ErrorResponse('Movie not found', 404));

  movie.title = title;
  movie.storyLine = storyLine;
  movie.releaseDate = releaseDate;
  movie.status = status;
  movie.type = type;
  movie.genres = genres;
  movie.tags = tags;
  movie.cast = cast;
  movie.trailer = trailer;
  movie.language = language;

  if (director) {
    if (!isValidObjectId(director))
      return next(new ErrorResponse('Invalid director id', 400));

    movie.director = director;
  }

  if (writers) {
    for (const writer of writers) {
      if (!isValidObjectId(writer))
        return next(new ErrorResponse('Invalid writer id', 400));
    }

    movie.writers = writers;
  }

  // update poster
  // removing poster from cloudinary if there is any
  const posterId = movie.poster?.public_id;
  if (posterId) {
    const { result } = await cloudinary.uploader.destroy(posterId);
    if (result !== 'ok')
      return next(
        new ErrorResponse('Error deleting poster from cloudinary', 500)
      );
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

  movie.poster = finalPoster;

  await movie.save();

  res.json({
    message: 'Movie is updated successfully',
    movie,
  });
});

exports.deleteMovie = asyncHandler(async (req, res, next) => {
  const {
    params: { movieId },
  } = req;

  if (!isValidObjectId(movieId))
    return next(new ErrorResponse('Invalid movie id', 400));

  const movie = await Movie.findById(movieId);

  if (!movie) return next(new ErrorResponse('Movie not found', 404));

  // removing poster from cloudinary if there is any
  const posterId = movie.poster?.public_id;
  if (posterId) {
    const result = await destroyImageFromCloudinary(posterId);
    if (result !== 'ok')
      return next(
        new ErrorResponse('Error deleting poster from cloudinary', 500)
      );
  }

  // removing trailer
  const trailerId = movie.trailer?.public_id;
  if (!trailerId) return next(new ErrorResponse('No trailer found', 404));

  const { result } = await cloudinary.uploader.destroy(trailerId, {
    resource_type: 'video',
  });

  if (result !== 'ok')
    return next(
      new ErrorResponse('Error deleting trailer from cloudinary', 500)
    );

  await movie.remove();

  res.json({
    message: 'Movie is deleted successfully',
  });
});

exports.getMoviesByAdmin = asyncHandler(async (req, res, next) => {
  const {
    query: { pageNo, limit },
  } = req;
  const count = await Movie.countDocuments();
  const result = await Movie.find({})
    .populate('director')
    .populate('writers')
    .populate('cast.actor')
    .sort('-createdAt')
    .skip(parseInt(pageNo) * parseInt(limit))
    .limit(parseInt(limit));

  res.json({
    result,
    count,
  });
});

exports.getLatestUploadsByAdmin = asyncHandler(async (req, res, next) => {
  const count = await Movie.countDocuments();
  const result = await Movie.find({})
    .populate('director')
    .populate('writers')
    .populate('cast.actor')
    .sort('-createdAt')
    .limit(6);

  res.json({
    result,
    count,
  });
});

exports.getLatestUploadsByUser = asyncHandler(async (req, res, next) => {
  const {
    query: { limit = 6 },
  } = req;
  const result = await Movie.find({ status: 'public' })
    .populate('director')
    .populate('writers')
    .populate('cast.actor')
    .sort('-createdAt')
    .limit(parseInt(limit));

  const movies = result?.map((movie) => {
    return {
      _id: movie._id,
      title: movie.title,
      storyLine: movie.storyLine,
      poster: movie.poster?.url,
      responsivePosters: movie?.poster?.responsive,
      trailer: movie.trailer?.url,
    };
  });

  res.json(movies);
});

exports.searchMovieByAdmin = asyncHandler(async (req, res, next) => {
  const {
    query: { title },
  } = req;
  if (!title.trim()) return next(new ErrorResponse('Invalid Request', 400));

  const result = await Movie.find({
    title: { $regex: `.*${title}.*`, $options: 'i' },
  }).sort('-createdAt');

  res.json(result);
});

exports.searchMovieByUser = asyncHandler(async (req, res, next) => {
  const {
    query: { title },
  } = req;
  if (!title.trim()) return next(new ErrorResponse('Invalid Request', 400));

  const result = await Movie.find({
    title: { $regex: `.*${title}.*`, $options: 'i' },
    status: 'public',
  })
    .select('title poster')
    .sort('-createdAt');

  res.json(result);
});

exports.getMovieById = asyncHandler(async (req, res, next) => {
  const {
    params: { movieId },
  } = req;

  if (!isValidObjectId(movieId))
    return next(new ErrorResponse('Invalid movie id', 400));

  const movie = await Movie.findById(movieId)
    .populate('director')
    .populate('writers')
    .populate('cast.actor');

  if (!movie) return next(new ErrorResponse('Movie not found', 404));

  // review aggregation
  // we cant pass req.params.movieId to aggregation but we can do a trick like this
  // mongoose.Types.ObjectId(req.params.movieId)
  // or we can use movie._id
  const reviews = await getMovieRatingAverage(movie._id);

  const {
    _id,
    title,
    storyLine,
    cast,
    writers,
    director,
    releaseDate,
    genres,
    tags,
    language,
    poster,
    trailer,
    type,
  } = movie;

  res.json({
    _id,
    title,
    storyLine,
    cast: cast?.map((el) => ({
      _id: el._id,
      profile: {
        _id: el.actor._id,
        name: el.actor.name,
        avatar: el.actor?.avatar?.url,
      },
      leadActor: el.leadActor,
      roleAs: el.roleAs,
    })),
    writers: writers?.map((el) => ({
      _id: el._id,
      name: el.name,
      avatar: el?.avatar?.url,
    })),
    director: {
      _id: director._id,
      name: director.name,
      avatar: director?.avatar?.url,
    },
    releaseDate,
    genres,
    tags,
    language,
    poster,
    trailer,
    type,
    reviews: { ...reviews },
  });
});

exports.getRelatedMoviesByTag = asyncHandler(async (req, res, next) => {
  const {
    params: { movieId },
  } = req;

  if (!isValidObjectId(movieId))
    return next(new ErrorResponse('Invalid movie id', 400));

  const movie = await Movie.findById(movieId);

  if (!movie) return next(new ErrorResponse('Movie not found', 404));

  // related movie aggregation
  const movies = await Movie.aggregate(relatedMoviesPipeline(movie));

  // with this code, we will receive an array of empty objects, we have to Promise.all to get the real result
  // const related = movies.map(async (movie) => {
  //   const reviews = await getMovieRatingAverage(movie._id);
  //   return {
  //     _id: movie._id,
  //     title: movie.title,
  //     poster: movie.poster,
  //     reviews: { ...reviews },
  //   };
  // });
  const related = await Promise.all(
    movies.map(async (movie) => {
      const reviews = await getMovieRatingAverage(movie._id);
      return {
        _id: movie._id,
        title: movie.title,
        poster: movie.poster,
        responsivePosters: movie?.responsivePosters,
        reviews: { ...reviews },
      };
    })
  );

  res.json(related);
});

exports.topRatedMovies = asyncHandler(async (req, res, next) => {
  const {
    query: { type = 'Film' },
  } = req;

  const movies = await Movie.aggregate(topRatedMoviesPipeline(type));

  const topRatedMoviesResults = await Promise.all(
    movies.map(async (movie) => {
      const reviews = await getMovieRatingAverage(movie._id);
      return {
        _id: movie._id,
        title: movie.title,
        poster: movie.poster,
        responsivePosters: movie.responsivePosters,
        reviews: { ...reviews },
      };
    })
  );

  res.json(topRatedMoviesResults);
});

exports.getAppAllInformation = asyncHandler(async (req, res, next) => {
  const movies = await Movie.countDocuments();
  const reviews = await Review.countDocuments();
  const users = await User.countDocuments();

  res.json({ movies, reviews, users });
});

exports.getMostRatedMovies = asyncHandler(async (req, res, next) => {
  const movies = await Movie.aggregate(topRatedMoviesPipeline());

  const topRatedMoviesResults = await Promise.all(
    movies.map(async (movie) => {
      const reviews = await getMovieRatingAverage(movie._id);
      return {
        _id: movie._id,
        title: movie.title,
        reviews: { ...reviews },
      };
    })
  );

  res.json(topRatedMoviesResults);
});
