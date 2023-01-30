const asyncHandler = require( 'express-async-handler' );

const User = require( '../models/userModel' );

// @desc    Add products to wishlist
// @route   Post /api/v1/wishlist
// @access  protected/User
exports.addProductToWishlist = asyncHandler( async ( req, res, next ) => {
    // => Add productId to wishlist array if productId is not exist  
    const user = await User.findByIdAndUpdate( req.user._id, {
        $addToSet: { wishlist: req.body.productId }
    },
        { new: true }
    );

    res.status( 200 ).json( { status: 'success', message: 'product added successfully', data: user.wishlist } );
} );

// @desc    Remove products from wishlist
// @route   Delete /api/v1/wishlist/:productId
// @access  protected/User
exports.removeProductFromWishlist = asyncHandler( async ( req, res, next ) => {
    // => Remove productId from wishlist array if productId is exist  
    const user = await User.findByIdAndUpdate( req.user._id, {
        $pull: { wishlist: req.params.productId }
    },
        { new: true }
    );

    res.status( 200 ).json( { status: 'success', message: 'product removed successfully', data: user.wishlist } );
} );

// @desc    Get Logged User wishlist
// @route   Get /api/v1/wishlist
// @access  protected/User
exports.getLoggedUserWishlist = asyncHandler( async ( req, res, next ) => { 
    const user = await User.findById( req.user._id ).populate( 'wishlist' );

    res.status( 200 ).json( { status: 'success', results: user.wishlist.length, data: user.wishlist } );
} )