const express = require( 'express' );



const { addProductToCart, getLoggedUserCart, removeSpecificCartItem, clearUserCart, updateCartItemQuantity, applyCoupon } = require( '../services/cartService' );

const authService = require( '../services/authService' );

const router = express.Router();

router.use( authService.protect, authService.allowedTo( 'user' ) );

router.route( '/' )
    .post( addProductToCart )
    .get( getLoggedUserCart )
    .delete( clearUserCart )

router.put( '/applyCoupon', applyCoupon )

router.route( '/:itemId' )
    .delete( removeSpecificCartItem )
    .put(updateCartItemQuantity)
module.exports = router