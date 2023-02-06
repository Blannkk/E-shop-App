const asyncHandler = require( 'express-async-handler' );
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const factory = require( './handlersFactory' );
const { uploadSingleImage } = require( '../middlewares/uploadImageMiddleware' );
const Category = require('../models/categoryModel');


// const multerStorage = multer.diskStorage( {
//     destination: function ( req, file, cb ) {
//         cb( null, 'uploads/categories' );
//     },
//     filename: function ( req, file, cb ) {
//         const ext = file.mimetype.split( '/' )[ 1 ];
//         const filename = `category-${ uuidv4() }-${ Date.now() }.${ ext }`;
//         cb( null, filename );
//     },
// } );

// const multerStorage = multer.memoryStorage();

// const multerFilter = function ( req, file, cb ) {
//     if ( file.mimetype.startsWith( 'image' ) )
//     {
//         cb( null, true );
//     } else
//     {
//         cb(new ApiError('only images are allowed', 400), false)
//     }
// }

// const upload = multer( { storage: multerStorage, fileFilter: multerFilter } );

// upload category image
exports.uploadCategoryImage = uploadSingleImage('image');

exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
    if (req.file)
    {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat('jpeg')
            .jpeg({ quality: 95 })
            .toFile(`uploads/categories/${filename}`);
    
        // Save image into our db
        req.body.image = filename;
    }
    next();
});

// @desc    get category
// @route   GET /api/v1/categories
// @access  public
exports.getCategories = factory.getAll( Category );

// @desc    get specific category by id
// @route   GET /api/v1/categories/:id
// @access  public
exports.getCategory = factory.getOne( Category );

// @desc    Create category
// @route   POST /api/v1/categories
// @access  private
exports.createCategory = factory.createOne( Category );



// @desc    update specific category by id
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne( Category );


// @desc    delete specific category by id
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
