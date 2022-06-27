const express = require('express');
const {
  secretUserForAdmin,
  secretUserForUser,
} = require('../controllers/user');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/user/secret', protect, authorize('admin'), secretUserForAdmin);
router.get(
  '/user/secret-user',
  protect,
  authorize('user', 'admin'),
  secretUserForUser
);

module.exports = router;
