const express = require('express');
const {
  createDirector,
  updateDirector,
  deleteDirector,
  searchDirector,
  getLatestUploadedDirectors,
  getSingleDirector,
  getDirectors,
} = require('../controllers/director');
const {
  directorInfoValidators,
  directorInfoValidate,
} = require('../middlewares/directorInfoValidator');

const { protect, authorize } = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/multer');

const router = express.Router();

router.post(
  '/directors/create',
  protect,
  authorize('admin'),
  uploadImage.single('avatar'),
  directorInfoValidators,
  directorInfoValidate,
  createDirector
);

router.put(
  '/directors/:directorId',
  uploadImage.single('avatar'),
  protect,
  authorize('admin'),
  directorInfoValidators,
  directorInfoValidate,
  updateDirector
);

router.delete(
  '/directors/:directorId',
  protect,
  authorize('admin'),
  deleteDirector
);
router.get('/directors/search', protect, authorize('admin'), searchDirector);
router.get('/directors/:directorId', getSingleDirector);
router.get('/directors/latest-uploads', getLatestUploadedDirectors);
router.get('/directors', protect, authorize('admin'), getDirectors);

module.exports = router;
