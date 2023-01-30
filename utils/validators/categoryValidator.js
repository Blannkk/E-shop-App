const slugify = require('slugify');
const { param, body } = require( 'express-validator' );
const validatorMiddleware = require('../../middlewares/validatorMiddleware')


exports.getCategoryValidator = [
    param('id').isMongoId().withMessage('invalid category id format')
    , validatorMiddleware
]

exports.createCategoryValidator = [
    body('name').notEmpty().withMessage('Category name required')
    .isString().withMessage('Category name must be string')
    .isLength({min: 3}).withMessage('too short Category name')
    .isLength( { max: 32 } ).withMessage( "too long Category name" )
    .custom( ( val, { req } ) => {
        req.body.slug = slugify( val );
        return true;
    })
    , validatorMiddleware
]

exports.updateCategoryValidator = [
    param('id').isMongoId().withMessage('invalid category id format'),
    body('name').optional()
    .isString().withMessage('Category name must be string')
    .isLength({min: 3}).withMessage('too short Category name')
    .isLength({max: 32}).withMessage("too long Category name")
    .optional()
    .custom((val, { req }) => {
      req.body.slug = slugify(val);
      return true;
    })
    , validatorMiddleware
]

exports.deleteCategoryValidator = [
    param('id').isMongoId().withMessage('invalid category id format')
    , validatorMiddleware
]



