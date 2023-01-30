const slugify = require( 'slugify' );
const { body, param } = require( 'express-validator' );
const validatorMiddleware = require('../../middlewares/validatorMiddleware')


exports.getSubCategoryValidator = [
    param('id').isMongoId().withMessage('invalid SubCategory id format')
    , validatorMiddleware
]

exports.createSubCategoryValidator = [
    body('name').notEmpty().withMessage('SubCategory name required')
    .isString().withMessage('SubCategory name must be string')
    .isLength({min: 2}).withMessage('too short SubCategory name')
    .isLength( { max: 32 } ).withMessage( "too long SubCategory name" )
    .custom( ( val, { req } ) => {
        req.body.slug = slugify( val );
        return true;
    }),
    body( 'category' ).notEmpty().withMessage( 'SubCategory must belong to a main Category' )
    .isMongoId().withMessage( 'invalid Category id format' )
    , validatorMiddleware
]

exports.updateSubCategoryValidator = [
    param('id').isMongoId().withMessage('invalid SubCategory id format'),
    body('name').notEmpty().withMessage('SubCategory name required')
    .isString().withMessage('SubCategory name must be string')
    .isLength({min: 3}).withMessage('too short SubCategory name')
    .isLength( { max: 32 } ).withMessage( "too long SubCategory name" )
    .optional()
    .custom((val, { req }) => {
          req.body.slug = slugify(val);
          return true;
        })
    , validatorMiddleware
]

exports.deleteSubCategoryValidator = [
    param('id').isMongoId().withMessage('invalid SubCategory id format')
    , validatorMiddleware
]



