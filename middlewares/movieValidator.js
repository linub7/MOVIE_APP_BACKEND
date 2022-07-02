const { isValidObjectId } = require('mongoose');
const { check, validationResult } = require('express-validator');

const genres = require('../utils/genres');

exports.movieValidators = [
  check('title').trim().not().isEmpty().withMessage('Please Provide a title'),
  check('storyLine')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Please Provide a storyLine'),
  check('releaseDate').isDate().withMessage('Please Provide a releaseDate'),
  check('status')
    .isIn(['public', 'private'])
    .withMessage('Please Provide a status'),
  check('type').trim().not().isEmpty().withMessage('Please Provide a type'),
  check('genres')
    .isArray()
    .withMessage('Genres must be an array of strings')
    .custom((value) => {
      for (const genre of value) {
        if (!genres.includes(genre)) throw new Error('Invalid genre');
      }
      return true;
    }),
  check('tags')
    .isArray({ min: 1 })
    .withMessage('Please Provide a tags')
    .custom((tags) => {
      for (const tag of tags) {
        if (typeof tag !== 'string')
          throw new Error('Tags must be an array of strings');
      }
      return true;
    }),
  check('cast')
    .isArray()
    .withMessage('Please Provide a cast')
    .custom((cast) => {
      for (const c of cast) {
        if (!isValidObjectId(c.actor))
          throw new Error('Invalid cast id inside cast');

        if (!c.roleAs?.trim()) throw new Error('Please Provide a roleAs');
        if (typeof c.leadActor !== 'boolean')
          throw new Error('Only boolean value is allowed for leadActor');
      }
      return true;
    }),
  check('poster').custom((_, { req }) => {
    if (!req.file) throw new Error('Please Provide a poster');
    return true;
  }),
  check('trailer')
    .isObject()
    .withMessage('Please Provide a trailer')
    .custom(({ url, public_id }) => {
      try {
        const result = new URL(url);
        if (!result.protocol.includes('http')) throw new Error('Invalid url');

        /*
        const url = 'https://res.cloudinary.com/dzqbzqjqw/video/upload/v1599098982/trailer_qjqjqz.mp4'
        const arr = url.split('/') => ['https:', '', 'res.cloudinary.com', 'dzqbzqjqw', 'video', 'upload', 'v1599098982', 'trailer_qjqjqz.mp4']
        arr[arr.length - 1] => trailer_qjqjqz.mp4
        trailer_qjqjqz.mp4.split('.')[0] => trailer_qjqjqz
        **/
        const arr = url.split('/');
        const pId = arr[arr.length - 1].split('.')[0];

        if (pId !== public_id) throw new Error('Invalid public_id');
        return true;
      } catch (err) {
        throw new Error('Invalid url');
      }
    }),
  check('language')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Please Provide a language'),
];

exports.movieValidator = (req, res, next) => {
  const error = validationResult(req).array();
  if (error.length) {
    return res.status(400).json({
      error: error.map((error) => error.msg),
    });
  }
  next();
};
