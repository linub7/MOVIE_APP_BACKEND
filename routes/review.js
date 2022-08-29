const express = require('express');
const {
  addReview,
  getReview,
  updateReview,
  deleteReview,
  getReviewsByMovie,
  getMovieReviewsByUser,
} = require('../controllers/review');
const { protect, authorize } = require('../middlewares/auth');
const {
  reviewValidators,
  reviewValidate,
} = require('../middlewares/reviewValidator');

const router = express.Router();

router.post(
  '/reviews/add',
  protect,
  reviewValidators,
  reviewValidate,
  addReview
);

router.get(
  '/reviews-by-user/:movieId',
  protect,
  authorize('admin', 'user'),
  getMovieReviewsByUser
);

router.get(
  '/reviews/:movieId/:reviewId',
  protect,
  authorize('admin', 'user'),
  getReview
);

router.get(
  '/movie-reviews/:movieId',
  protect,
  authorize('admin'),
  getReviewsByMovie
);
router.patch(
  '/reviews/:reviewId',
  protect,
  authorize('user', 'admin'),
  reviewValidators,
  reviewValidate,
  updateReview
);

router.delete(
  '/reviews/:reviewId',
  protect,
  authorize('admin', 'user'),
  deleteReview
);

module.exports = router;
