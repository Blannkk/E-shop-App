const asyncHandler = require( 'express-async-handler' );

const User = require( '../models/userModel' );

// @desc    Add Address To User Addresses List
// @route   Post /api/v1/addresses
// @access  protected/User
exports.addAddress = asyncHandler( async ( req, res, next ) => {
    // => Add Address object to addresses array if it is not exist  
    const user = await User.findByIdAndUpdate( req.user._id, {
        $addToSet: { addresses: req.body }
    },
        { new: true }
    );

    res.status( 200 ).json( { status: 'success', message: 'address added successfully', data: user.addresses } );
} );

// @desc    Remove Address 
// @route   Delete /api/v1/address/:addressId
// @access  protected/User
exports.removeAddress = asyncHandler( async ( req, res, next ) => {
    // => Remove Address from addresses array if  it is exist  
    const user = await User.findByIdAndUpdate( req.user._id, {
        $pull: { addresses: {_id: req.params.addressId} }
    },
        { new: true }
    );

    res.status( 200 ).json( { status: 'success', message: 'address removed successfully', data: user.addresses } );
} );

// @desc    Get Logged User Addresses
// @route   Get /api/v1/addresses
// @access  protected/User
exports.getLoggedUserAddressesList = asyncHandler( async ( req, res, next ) => { 
    const user = await User.findById( req.user._id ).populate( 'addresses' );

    res.status( 200 ).json( { status: 'success', results: user.addresses.length, data: user.addresses } );
} )