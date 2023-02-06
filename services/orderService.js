const stripe = require( 'stripe' )( process.env.STRIPE_SECRET );

const asyncHandler = require( 'express-async-handler' );
const factory = require( './handlersFactory' );

const ApiError = require( '../utils/apiError' );

const User = require('../models/userModel');
const Cart = require( '../models/cartModel' );
const Order = require( '../models/orderModel' );
const Product = require('../models/productModel');


const expressAsyncHandler = require('express-async-handler');


// @desc    create a cash order
// @route   POST /api/v1/orders/cartId
// @access  protected/User
exports.createCashOrder = asyncHandler( async ( req, res, next ) => {
    // app settings 
    const taxPrice = 0;
    const shippingPrice = 0;
    // 1 Get cart based on cartId
    const cart = await Cart.findById( req.params.cartId );
    if ( !cart ) return next( new ApiError( `there is no cart with this id ${ req.params.cartId }`, 404 ) );

    // 2 Get order price based on cart price (check if coupon applied )
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
    
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // 3 create order 
    const order = await Order.create( {
        user: req.user._id,
        cartItems: cart.cartItems,
        totalOrderPrice
    } );

    // 4 update product(decrement quantity, increment product sold );
    if ( order ) {
        const bulkOption = cart.cartItems.map( ( item ) => ( {
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
            },
        } ) );
        
        await Product.bulkWrite( bulkOption, {} );
    
        // 5 clear Cart 
        await Cart.findByIdAndDelete( req.params.cartId );
    }

    res.status( 201 ).json( { message: 'success', data: order } );
} );

exports.filterOrderForLoggedUser = asyncHandler( async ( req, res, next ) => {
    if (req.user.role === 'user') req.filterObj = { user: req.user._id };
    next();
} );

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  protected/User-Admin-Manger
exports.getAllOrders = factory.getAll( Order );

// @desc    Get Specific order
// @route   GET /api/v1/orders/:id
// @access  protected/User-Admin-Manger
exports.getSpecificOrder = factory.getOne( Order );

// @desc    Update order paid status to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  protected/Admin-Manger
exports.updateOrderPaidStatus = asyncHandler( async ( req, res, next ) => {
    const order = await Order.findById( req.params.id );
    if ( !order ) return next( new ApiError( `there is no order for this ID : ${ req.params.id }`, 404 ) );
    
    // update status
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();

    res.status( 200 ).json( { message: 'success', data: updatedOrder } );
} );

// @desc    Update order delivered status 
// @route   PUT /api/v1/orders/:id/deliver
// @access  protected/Admin-Manger
exports.updateOrderDeliveredStatus = asyncHandler( async ( req, res, next ) => {
    const order = await Order.findById( req.params.id );
    if ( !order ) return next( new ApiError( `there is no order for this ID : ${ req.params.id }`, 404 ) );
    
    // update status
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.status( 200 ).json( { message: 'success', data: updatedOrder } );
} );

// @desc    Get checkout session from stripe and send it to response
// @route   GET /api/v1/orders/checkout-session/:cartId
// @access  protected/User
exports.checkoutSession = asyncHandler( async ( req, res, next ) => {
    // app settings 
    const taxPrice = 0;
    const shippingPrice = 0;
    // 1 Get cart based on cartId
    const cart = await Cart.findById( req.params.cartId );
    if ( !cart ) return next( new ApiError( `there is no cart with this id ${ req.params.cartId }`, 404 ) );

    // 2 Get order price based on cart price (check if coupon applied )
    const cartPrice = cart.totalPriceAfterDiscount ? cart.totalPriceAfterDiscount : cart.totalCartPrice;
    
    const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    // 3) Create stripe checkout session
    const session = await stripe.checkout.sessions.create( {
        line_items: [
            {
                price_data: {
                    currency: 'egp',
                    product_data: {
                      name: req.user.name,
                    },
                    unit_amount: totalOrderPrice * 100 ,
                  },
            quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${ req.protocol }://${ req.get( 'host' ) }/orders`,
        cancel_url: `${ req.protocol }://${ req.get( 'host' ) }/cart`,
        customer_email: req.user.email,
        client_reference_id: req.params.cartId,
        metadata: req.body.shippingAddress,
    } );

    // 4) send session to response
    res.status( 200 ).json( { status: 'success', session } );
});

const createCardOrder = async (session) => {
    const cartId = session.client_reference_id;
    const shippingAddress = session.metadata;
    const orderPrice = session.amount_total / 100;

    const cart = await Cart.findById(cartId);
    const user = await User.findOne({ email: session.customer_email });

    // 3 create order 
    const order = await Order.create( {
        user: user._id,
        cartItems: cart.cartItems,
        shippingAddress,
         totalOrderPrice: orderPrice,
         isPaid: true,
         paidAt: Date.now(),
        paymentMethod: 'card',
    });
    
    // 4 update product(decrement quantity, increment product sold );
    if ( order ) {
        const bulkOption = cart.cartItems.map( ( item ) => ( {
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
            },
        })
        );
        
        await Product.bulkWrite( bulkOption, {} );
    
        // 5 clear Cart 
        await Cart.findByIdAndDelete( cartId );
    }

}

exports.webhookCheckout = expressAsyncHandler(async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
      
    let event;
      
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (event.type === 'checkout.session.completed')
    {
        createCardOrder(event.data.object);
    }
    res.status(200).json({ received: true });
})