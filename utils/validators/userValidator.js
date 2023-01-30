const slugify = require('slugify');
const { param, body } = require( 'express-validator' );
const validatorMiddleware = require('../../middlewares/validatorMiddleware');
const User = require( '../../models/userModel' );



exports.createUserValidator = [
    body('name').notEmpty().withMessage('User name required')
    .isString().withMessage('User name must be string')
    .isLength({min: 3}).withMessage('too short User name')
    .custom( ( val, { req } ) => {
        req.body.slug = slugify( val );
        return true;
    } ),

    body( 'email' ).notEmpty()
        .withMessage( 'email required' )
        .isEmail().withMessage( 'email must be a valid email address' )
        .custom( ( val ) => User.findOne( { email: val } ).then( ( user ) => {
            if ( user )
            {
            return Promise.reject( new Error(' email already exists') );
        }
        } )
    ),

    body( 'password' ).notEmpty()
    .withMessage( 'password required' )
    .isLength( { min: 8 } ).withMessage( ' password must be at least 8 characters' )
    .custom( ( password , {req} ) => {
        if ( password !== req.body.passwordConfirm )
        {
            throw new Error( 'passwordConfirm is incorrect' );
        }
        return true;
    }),
    
    body( 'passwordConfirm' ).notEmpty()
    .withMessage(' password Confirm required'),
    
    body( 'profileImg' ).optional(),
    
    body('phone').optional().isMobilePhone('ar-EG').withMessage('invalid phone number'),
    
    body('role').optional(),
    validatorMiddleware
]

exports.getUserValidator = [
    param('id').isMongoId().withMessage('invalid User id format')
    , validatorMiddleware
]


exports.updateUserValidator = [
    param('id').isMongoId().withMessage('invalid User id format'),
    body('name').optional()
    .isString().withMessage('User name must be string')
    .isLength({min: 3}).withMessage('too short User name')
    .isLength( { max: 32 } ).withMessage( "too long User name" )
    .custom( ( val, { req } ) => {
        req.body.slug = slugify( val );
        return true;
    })
    ,body( 'email' ).optional()
    .isEmail().withMessage( 'email must be a valid email address' )
    .custom( ( val ) => User.findOne( { email: val } ).then( ( user ) => {
        if ( user )
        {
        return Promise.reject( new Error(' email already exists') );
    }
    } )
    ),
    body( 'profileImg' ).optional(),
    
    body('phone').optional().isMobilePhone('ar-EG').withMessage('invalid phone number'),

    body( 'role' ).optional(),
    validatorMiddleware
]

exports.deleteUserValidator = [
    param('id').isMongoId().withMessage('invalid User id format')
    , validatorMiddleware
]

exports.updateLoggedUserValidator = [
    body('name').optional()
    .isString().withMessage('User name must be string')
    .isLength({min: 3}).withMessage('too short User name')
    .isLength( { max: 32 } ).withMessage( "too long User name" )
    .custom( ( val, { req } ) => {
        req.body.slug = slugify( val );
        return true;
    })
    ,body( 'email' ).optional()
    .isEmail().withMessage( 'email must be a valid email address' )
    .custom( ( val ) => User.findOne( { email: val } ).then( ( user ) => {
        if ( user )
        {
        return Promise.reject( new Error(' email already exists') );
    }
    } 
    )
    ),
    body('phone').optional().isMobilePhone('ar-EG').withMessage('invalid phone number'),
    validatorMiddleware
]