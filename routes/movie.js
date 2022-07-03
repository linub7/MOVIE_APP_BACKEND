const express = require('express');
const {
  uploadTrailer,
  createMovie,
  updateMovieWithoutPoster,
  updateMovieWithPoster,
  deleteMovie,
} = require('../controllers/movie');
const { protect, authorize } = require('../middlewares/auth');
const {
  movieValidators,
  movieValidator,
} = require('../middlewares/movieValidator');
const { uploadVideo, uploadImage } = require('../middlewares/multer');
const { parseData } = require('../utils/helper');

const router = express.Router();

router.post(
  '/movie/upload-trailer',
  protect,
  authorize('admin'),
  uploadVideo.single('video'),
  uploadTrailer
);

router.post(
  '/movie/create',
  protect,
  authorize('admin'),
  uploadImage.single('poster'),
  parseData,
  // movieValidators,
  // movieValidator,
  createMovie
);

router.patch(
  '/movie/without-poster/:movieId',
  protect,
  authorize('admin'),
  parseData,
  movieValidators,
  movieValidator,
  updateMovieWithoutPoster
);

router.patch(
  '/movie/with-poster/:movieId',
  protect,
  authorize('admin'),
  uploadImage.single('poster'),
  parseData,
  movieValidators,
  movieValidator,
  updateMovieWithPoster
);

router.delete('/movie/:movieId', protect, authorize('admin'), deleteMovie);

module.exports = router;
