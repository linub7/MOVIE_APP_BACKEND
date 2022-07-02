const multer = require('multer');
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new Error('File type not supported'), false);
  }
  cb(null, true);
};

exports.uploadImage = multer({
  storage,
  fileFilter,
  //   limits: {
  //     fileSize: 1024 * 1024 * 2,
  //   },
});
