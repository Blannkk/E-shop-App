const express = require( 'express' );



const { createCashOrder, getAllOrders, getSpecificOrder, filterOrderForLoggedUser, updateOrderPaidStatus, updateOrderDeliveredStatus, checkoutSession } = require( '../services/orderService' );
const authService = require( '../services/authService' );
      

const router = express.Router();

router.use( authService.protect );

router.get( '/checkout-session/:cartId', authService.allowedTo( 'user' ), checkoutSession );

router.route( '/:cartId' )
    .post(  authService.allowedTo( 'user' ), createCashOrder );

router.get( '/',  authService.allowedTo( 'user', 'admin', 'manager' ), filterOrderForLoggedUser, getAllOrders );

router.get( '/:id', (  authService.allowedTo( 'user', 'admin', 'manager' ), getSpecificOrder ) );

router.put( '/:id/pay',   authService.allowedTo( 'admin', 'manager') , updateOrderPaidStatus  );
router.put( '/:id/deliver', (  authService.allowedTo( 'admin', 'manager' )), updateOrderDeliveredStatus );
module.exports = router