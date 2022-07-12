const express = require('express');
const {
  createWriter,
  updateWriter,
  deleteWriter,
  searchWriter,
  getLatestUploadedWriters,
  getSingleWriter,
  getWriters,
} = require('../controllers/writer');
const {
  writerInfoValidators,
  writerInfoValidate,
} = require('../middlewares/writerInfoValidator');

const { protect, authorize } = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/multer');

const router = express.Router();

router.post(
  '/writers/create',
  protect,
  authorize('admin'),
  uploadImage.single('avatar'),
  writerInfoValidators,
  writerInfoValidate,
  createWriter
);

router.put(
  '/writers/:writerId',
  uploadImage.single('avatar'),
  protect,
  authorize('admin'),
  writerInfoValidators,
  writerInfoValidate,
  updateWriter
);

router.delete('/writers/:writerId', protect, authorize('admin'), deleteWriter);
router.get('/writers/search', searchWriter);
router.get('/writers/:writerId', getSingleWriter);
router.get('/writers/latest-uploads', getLatestUploadedWriters);
router.get('/writers', protect, authorize('admin'), getWriters);

module.exports = router;
