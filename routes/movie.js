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
  getMovieById,
  getLatestUploadsByUser,
  getRelatedMoviesByTag,
  topRatedMovies,
  getAppAllInformation,
  getMostRatedMovies,
  searchMovieByUser,
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

router.get('/movies/latest-uploads-user', getLatestUploadsByUser);

router.get('/movies/search', protect, authorize('admin'), searchMovieByAdmin);
router.get('/movies/search-by-user', protect, searchMovieByUser);
router.get('/movies/top-rated', topRatedMovies);
router.get('/movies/:movieId', getMovieById);
router.get('/movies/related-by-tag/:movieId', getRelatedMoviesByTag);

router.get(
  '/app-information',
  protect,
  authorize('admin'),
  getAppAllInformation
);

router.get('/most-rated', protect, authorize('admin'), getMostRatedMovies);

module.exports = router;
