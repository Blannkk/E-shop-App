const { check } = require( 'express-validator' );
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const Review = require( '../../models/reviewModel' );


exports.getReviewValidator = [
    check('id').isMongoId().withMessage('invalid Review id format')
    , validatorMiddleware
]

exports.createReviewValidator = [
    check( 'title' ).optional(),
    check( 'ratings' ).notEmpty()
        .withMessage( 'ratings value is required' )
        .isFloat( { min: 1, max: 5 } )
        .withMessage( 'ratings value must be between 1 and 5' ),
    
    check( 'user' ).isMongoId().withMessage( 'in valid user id format' ),
    check( 'product' ).isMongoId().withMessage( 'in valid product id format' )
        .custom( ( val, { req }) =>
            Review.findOne( { user: req.user._id, product: req.body.product } ).then(
                (review) => {
                    if ( review )
                    {
                        return Promise.reject(
                            new Error( 'you already created a review for this product' )
                        );
                    }
                }
            )
    ),
    validatorMiddleware
]

exports.updateReviewValidator = [
    check( 'id' ).isMongoId().withMessage( 'invalid Review id format' )
        .custom( ( val, { req } ) => 
            Review.findById( val ).then( ( review ) => {
                if ( !review )
                {
                    return Promise.reject(new Error(`There is no review with id ${val}`));
                }
                if ( review.user._id.toString() !== req.user._id.toString() )
                {
                    return Promise.reject( new Error( `your are not allowed to perform this action` ) );
                } 
            } ) )
    ,
    validatorMiddleware
]

exports.deleteReviewValidator = [
    check( 'id' ).isMongoId().withMessage( 'invalid Review id format' )
        .custom( ( val, { req } ) => {
            if ( req.user.role === 'user' )
            {
               return Review.findById( val ).then( ( review ) => {
                    if ( !review )
                    {
                        return Promise.reject(new Error(`There is no review with id ${val}`));
                    }
                    if ( review.user._id.toString() !== req.user._id.toString() )
                    {
                        return Promise.reject( new Error( `your are not allowed to perform this action` ) );
                    } 
                } )  
            }
            return true;
        } ),
    validatorMiddleware
]



