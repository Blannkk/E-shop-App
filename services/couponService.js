const factory = require( './handlersFactory' );

const Coupon = require('../models/couponModel');


// @desc    get coupons 
// @route   GET /api/v1/coupons
// @access  private/Admin-manager
exports.getCoupons = factory.getAll( Coupon );

// @desc    get specific coupon by id
// @route   GET /api/v1/coupons/:id
// @access  private/Admin-manager
exports.getCoupon = factory.getOne( Coupon );

// @desc    Create Coupon
// @route   POST /api/v1/coupons
// @access  private/Admin-manager
exports.createCoupon = factory.createOne( Coupon );



// @desc    update specific coupon by id
// @route   PUT /api/v1/coupons/:id
// @access  private/Admin-manager
exports.updateCoupon = factory.updateOne( Coupon );


// @desc    delete specific coupon by id
// @route   DELETE /api/v1/coupons/:id
// @access  private/Admin-manager
exports.deleteCoupon = factory.deleteOne( Coupon );