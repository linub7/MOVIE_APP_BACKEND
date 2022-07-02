const express = require('express');
const {
  createActor,
  updateActor,
  deleteActor,
  searchActor,
  getLatestUploadedActors,
  getSingleActor,
} = require('../controllers/actor');
const {
  actorInfoValidators,
  actorInfoValidate,
} = require('../middlewares/actorInfoValidator');

const { protect, authorize } = require('../middlewares/auth');
const { uploadImage } = require('../middlewares/multer');

const router = express.Router();

router.post(
  '/actors/create',
  protect,
  authorize('admin'),
  // actorInfoValidators,
  // actorInfoValidate,
  uploadImage.single('avatar'),
  createActor
);

router.put(
  '/actors/:actorId',
  uploadImage.single('avatar'),
  protect,
  authorize('admin'),
  updateActor
);

router.delete('/actors/:actorId', protect, authorize('admin'), deleteActor);
router.get('/actors/search', searchActor);
router.get('/actors/:actorId', getSingleActor);
router.get('/actors/latest-uploads', getLatestUploadedActors);

module.exports = router;
