const express = require( 'express' );
const { getProductValidator,
     createProductValidator,
     updateProductValidator,
    deleteProductValidator,
} =
    require( '../utils/validators/productValidator' );


const { getProducts,
      createProduct,
      getProduct,
      updateProduct,
    deleteProduct,
    uploadProductImages,
      resizeProductImages
} = require( '../services/productService' );
const authService = require( '../services/authService' );
const reviewRoute = require( './reviewRoute' );

const router = express.Router();

// Nested route
router.use( '/:productId/reviews', reviewRoute );


router.route( '/' )
    .get( getProducts )
    .post(authService.protect, authService.allowedTo('admin', 'manger'), uploadProductImages,
        resizeProductImages, createProductValidator, createProduct );

router.route( '/:id' )
    .get( getProductValidator, getProduct )
    .put(authService.protect, authService.allowedTo('admin', 'manger'), uploadProductImages,
        resizeProductImages, updateProductValidator, updateProduct )
    .delete(authService.protect, authService.allowedTo('admin'), deleteProductValidator, deleteProduct )

module.exports = router