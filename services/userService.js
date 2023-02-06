const asyncHandler = require( 'express-async-handler' );
const bcrypt = require( 'bcryptjs' );

const sharp = require( 'sharp' );
const jwt = require( 'jsonwebtoken' );
const { v4: uuidv4 } = require('uuid');
const { uploadSingleImage } = require( '../middlewares/uploadImageMiddleware' );
const factory = require( './handlersFactory' );
const ApiError = require( '../utils/apiError' );
const createToken = require( '../utils/createToken' );

const User = require('../models/userModel');


exports.resizeImage = asyncHandler( async ( req, res, next ) => {
    const filename = `user-${ uuidv4() }-${ Date.now() }.jpeg`;
    if ( req.file )
    {
   await sharp( req.file.buffer )
   .resize( 600, 600 )
   .toFormat( 'jpeg' )
   .jpeg( { quality: 90 } )
   .toFile( `uploads/users/${ filename }` );

   req.body.profileImg = filename;
    }
        
    next();
})

// upload user image
exports.uploadUserImage = uploadSingleImage( 'profileImg' );

// @desc    get user
// @route   GET /api/v1/users
// @access  Private
exports.getUsers = factory.getAll( User );

// @desc    get specific user by id
// @route   GET /api/v1/users/:id
// @access  Private
exports.getUser = factory.getOne( User );

// @desc    Create user
// @route   POST /api/v1/users
// @access  private
exports.createUser = factory.createOne( User );



// @desc    update specific user by id
// @route   PUT /api/v1/users/:id
// @access  Private
exports.updateUser = asyncHandler( async(req, res, next) => {
    const { id } = req.params;
  
    const doc = await User.findByIdAndUpdate( req.params.id, {
        name: req.body.name,
        slug: req.body.slug,
        role: req.body.role,
        email: req.body.email,
        phone: req.body.phone,
        profileImg: req.body.profileImg
    }, 
      {new: true});
  
      if (!doc) {
        return next(new ApiError(`No doc for this id ${id}`, 404));
      }
  
    res.status(200).json({data: doc})
} );

// @desc    change user password
// @route   PUT /api/users/:id/changepassword
// @access  private
exports.ChangeUserPassword = asyncHandler( async(req, res, next) => {
    const { id } = req.params;
  
    const doc = await User.findByIdAndUpdate( req.params.id, {
      password: await bcrypt.hash( req.body.password, 12 ),
      passwordChangedAt: Date.now()
    }, 
      {new: true});
  
      if (!doc) {
        return next(new ApiError(`No doc for this id ${id}`, 404));
      }
  
    res.status(200).json({data: doc})
} );

// @desc    delete specific user by id
// @route   DELETE /api/v1/users/:id
// @access  Private
exports.deleteUser = factory.deleteOne( User );

// @desc    get logged user data
// @route   GET /api/v1/users/getMe
// @access  Private/protect
exports.getLoggedUserDate = asyncHandler( async ( req, res, next ) => {
  req.params.id = req.user._id;
  next();
} );

// @desc    update logged user password
// @route   PUT /api/v1/users/changeMyPassword
// @access  Private/protect
exports.updateLoggedUserPassword = asyncHandler( async ( req, res, next ) => {
  const user = await User.findByIdAndUpdate( req.user._id, {
    password: await bcrypt.hash( req.body.password, 12 ),
    passwordChangedAt: Date.now()
  },
    { new: true }
  );

  const token = createToken( user._id );
  
  res.status( 200 ).json( { data: user, token } );
} );

// @desc    update logged user data without(password, role)
// @route   PUT /api/v1/users/updateMe
// @access  Private/protect
exports.updateLoggedUserData = asyncHandler( async ( req, res, next ) => { 
  const updatedUser = await User.findByIdAndUpdate( req.user._id, {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  },
    { new: true }
  );
  res.status( 200 ).json( { data: updatedUser } );
} );

// @desc    delete logged user 
// @route   DELETE /api/v1/users/deleteMe
// @access  Private/protect
exports.deactivateLoggedUser = asyncHandler( async ( req, res, next ) => { 
  await User.findByIdAndUpdate( req.user._id, { active: false } );

  res.status( 204 ).json( { status: 'success' } );
} );