const crypto = require('crypto');

const asyncHandler = require( 'express-async-handler' );
const jwt = require( 'jsonwebtoken' );
const bcrypt = require( 'bcryptjs' );

const User = require( '../models/userModel' );
const ApiError = require( '../utils/apiError' );
const sendEmail = require( '../utils/sendEmail' );
const createToken = require( '../utils/createToken' );



exports.signup = asyncHandler( async ( req, res, next ) => {
    //1) signup a new user

    const user = await User.create( {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    } );
    // 2) generate a user token
    const token = createToken( user._id );
    // const token = jwt.sign( { userId: user._id, }, process.env.JWT_SECRET_KEY, {
    //     expiresIn: process.env.JWT_EXPIRE_TIME
    // } );

    res.status( 201 ).json( { data: user, token } );
} );

exports.login = asyncHandler( async ( req, res, next ) => {
    const user = await User.findOne( { email: req.body.email } );

    if ( !user || !( await bcrypt.compare( req.body.password, user.password ) ) )
    {
        return next( new ApiError( ' invalid email or password', 401 ) );
    }
    const token = createToken( user._id );

    res.status( 200 ).json( { data: user, token } );
} );

exports.protect = asyncHandler( async ( req, res, next ) => {
    // 1) check if token exist 
    let token;
    if ( req.headers.authorization && req.headers.authorization.startsWith( 'Bearer ' ) )
    {
        token = req.headers.authorization.split( ' ' )[ 1 ];
    }
    if ( !token )
    {
        return next( new ApiError( 'pleas login first', 401 ) );
    }

    // 2) verify a token (no changes happens )
    const decoded = jwt.verify( token, process.env.JWT_SECRET_KEY );
    // console.log( decoded );

    // 3) check if user exist
    const currentUser = await User.findById( decoded.userId )
    if ( !currentUser )
    {
        return next( new ApiError( 'this user is no longer exist', 401 ) );
    }

    // 4) check if user changed his password after token created 
    if ( currentUser.passwordChangedAt )
    {
        const passwordChangedTimeStamp = parseInt(
            currentUser.passwordChangedAt.getTime() / 1000,
            10
        );
        if ( passwordChangedTimeStamp > decoded.iat )
        {
            return next( new ApiError( 'User recently changed his password, please login again', 401 )
            );
        }
    }
    req.user = currentUser;
    next();
} );

exports.allowedTo = ( ...roles ) => asyncHandler( async ( req, res, next ) => {
    if ( !roles.includes( req.user.role ) )
    {
        return next( new ApiError( 'you are not allowed to access this route', 403 ) );
    }
    next();
} );

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotPassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // 1) Get user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new ApiError(`There is no user with that email ${req.body.email}`, 404)
      );
    }
    // 2) If user exist, Generate hash reset random 6 digits and save it in db
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetCode = crypto
      .createHash('sha256')
      .update(resetCode)
      .digest('hex');
  
    // Save hashed password reset code into db
    user.passwordResetCode = hashedResetCode;
    // Add expiration time for password reset code (10 min)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;
  
    await user.save();
  
    // 3) Send the reset code via email
    const message = `Hi ${user.name},\n We received a request to reset the password on your E-shop Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset code (valid for 10 min)',
        message,
      });
    } catch (err) {
      user.passwordResetCode = undefined;
      user.passwordResetExpires = undefined;
      user.passwordResetVerified = undefined;
  
      await user.save();
      return next(new ApiError('There is an error in sending email', 500));
    }
  
    res
      .status(200)
      .json({ status: 'Success', message: 'Reset code sent to email' });
} );


// @desc    verify password reset code
// @route   POST /api/v1/auth/verifypassword
// @access  Public
exports.verifyPasswordResetCode = asyncHandler( async ( req, res, next ) => {
    const hashedResetCode = crypto
        .createHash( 'sha256' )
        .update( req.body.resetCode )
        .digest( 'hex' );
    
    const user = await User.findOne( {
        passwordResetCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() },
    } );
    if ( !user )
    {
        return next( new ApiError( 'Reset Code invalid or expired' ) );
    }
    user.passwordResetVerified = true;
    await user.save();
    res.status( 200 ).json( { status: 'success' } );
} );

// @desc    reset user password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler( async ( req, res, next ) => {
    // 1 ) get user based on email
    const user = await User.findOne( { email: req.body.email } );
    if ( !user )
    {
        return next( new ApiError( `There is no user with this email ${ req.body.email }`, 404 ) );
    }

    // 2) check if reset code verified
    if ( !user.passwordResetVerified )
    {
        return next( new ApiError( `reset code not verified`, 400 ) );
    }
    user.password = req.body.newPassword;
    
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
  
    await user.save();

    // 3) everything is ok, generate new token
    const token = createToken( user._id );

    res.status( 200 ).json( { token } );
} );