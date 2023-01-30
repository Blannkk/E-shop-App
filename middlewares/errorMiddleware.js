const ApiError = require( "../utils/apiError" );

const sendForDev = ( err, res ) => res.status( err.statusCode ).json( {
  status: err.status,
  err: err,
  message: err.message,
  stack: err.stack
} );

const sendForProd = ( err, res ) => res.status( err.statusCode ).json( {
  status: err.status,
  message: err.message
} );

const handelJwtInvalidSignature = () => 
  new ApiError( 'Invalid Token, please login again', 401 );

const handelJwtExpiredToken = () => 
  new ApiError( 'ُExpired Token, please login again', 401 );

const globalError = ( err, req, res, next ) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if ( process.env.NODE_ENV === 'development' )
  {
    sendForDev( err, res );
  } else
  {
    if (err.name === 'JsonWebTokenError') err = handelJwtInvalidSignature();
    if (err.name === 'TokenExpiredError') err = handelJwtExpiredToken();
    sendForProd( err, res );
  }
};





module.exports = globalError;  