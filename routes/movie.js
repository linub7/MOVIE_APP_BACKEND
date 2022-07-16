const express = require('express');
const {
  uploadTrailer,
  createMovie,
  updateMovieWithoutPoster,
  updateMovieWithPoster,
  deleteMovie,
  getMoviesByAdmin,
  searchMovieByAdmin,
  getLatestUploadsByAdmin,
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
  movieValidators,
  movieValidator,
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

router.get('/movies-admin', protect, authorize('admin'), getMoviesByAdmin);
router.get(
  '/movies/latest-uploads',
  protect,
  authorize('admin'),
  getLatestUploadsByAdmin
);

router.get('/movies/search', protect, authorize('admin'), searchMovieByAdmin);

module.exports = router;
