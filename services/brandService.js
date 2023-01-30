const asyncHandler = require( 'express-async-handler' );

const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const { uploadSingleImage } = require( '../middlewares/uploadImageMIddleware' );
const factory = require( './handlersFactory' );

const Brand = require('../models/brandModel');


exports.resizeImage = asyncHandler( async ( req, res, next ) => {
    const filename = `brand-${ uuidv4() }-${ Date.now() }.jpeg`;
   await sharp( req.file.buffer )
    .resize( 600, 600 )
    .toFormat( 'jpeg' )
    .jpeg( { quality: 90 } )
    .toFile( `uploads/brands/${ filename }` );

    req.body.image = filename;
    next();
})

// upload Brand image
exports.uploadBrandImage = uploadSingleImage( 'image' );

// @desc    get brand
// @route   GET /api/v1/brands
// @access  public
exports.getBrands = factory.getAll( Brand );

// @desc    get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  public
exports.getBrand = factory.getOne( Brand );

// @desc    Create brand
// @route   POST /api/v1/brands
// @access  private
exports.createBrand = factory.createOne( Brand );



// @desc    update specific brand by id
// @route   PUT /api/v1/brands/:id
// @access  Private
exports.updateBrand = factory.updateOne( Brand );


// @desc    delete specific brand by id
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteBrand = factory.deleteOne( Brand );