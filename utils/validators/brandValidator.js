const slugify = require('slugify');
const { param, body } = require( 'express-validator' );
const validatorMiddleware = require('../../middlewares/validatorMiddleware')


exports.getBrandValidator = [
    param('id').isMongoId().withMessage('invalid Brand id format')
    , validatorMiddleware
]

exports.createBrandValidator = [
    body('name').notEmpty().withMessage('Brand name required')
    .isString().withMessage('Brand name must be string')
    .isLength({min: 3}).withMessage('too short Brand name')
    .isLength( { max: 32 } ).withMessage( "too long Brand name" )
    .custom( ( val, { req } ) => {
        req.body.slug = slugify( val );
        return true;
    })
    , validatorMiddleware
]

exports.updateBrandValidator = [
    param('id').isMongoId().withMessage('invalid Brand id format'),
    body('name').optional()
    .isString().withMessage('Brand name must be string')
    .isLength({min: 3}).withMessage('too short Brand name')
    .isLength( { max: 32 } ).withMessage( "too long Brand name" )
    .custom( ( val, { req } ) => {
        req.body.slug = slugify( val );
        return true;
    })
    , validatorMiddleware
]

exports.deleteBrandValidator = [
    param('id').isMongoId().withMessage('invalid Brand id format')
    , validatorMiddleware
]



