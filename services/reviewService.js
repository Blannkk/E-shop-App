const factory = require( './handlersFactory' );

const Review = require('../models/reviewModel');

exports.createFilterObj = ( req, res, next ) => {
    let filterObject = {};
    if ( req.params.productId ) filterObject = { product: req.params.productId };
    req.filterObj = filterObject;
    next();
};

// @desc    get review
// @route   GET /api/v1/reviews
// @access  public
exports.getReviews = factory.getAll( Review );

// @desc    get specific Review by id
// @route   GET /api/v1/reviews/:id
// @access  public
exports.getReview = factory.getOne( Review );


exports.setProductIdAndUserIdToBody = ( req, res, next ) => {
    // nested route
    if ( !req.body.product ) req.body.product = req.params.productId;
    if ( !req.body.user ) req.body.user = req.user._id;
    next();
};  
// @desc    Create Review
// @route   POST /api/v1/reviews
// @access  private/protect/User
exports.createReview = factory.createOne( Review );

// @desc    update specific Review by id
// @route   PUT /api/v1/reviews/:id
// @access  Private/protect/User
exports.updateReview = factory.updateOne( Review );

// @desc    delete specific Review by id
// @route   DELETE /api/v1/reviews/:id
// @access  Private/protect/User-Admin-Manager
exports.deleteReview = factory.deleteOne( Review );