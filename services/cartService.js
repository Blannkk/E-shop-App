const asyncHandler = require( 'express-async-handler' );
const ApiError = require( '../utils/apiError' );

const Product = require( '../models/productModel' );
const Coupon = require( '../models/couponModel' );
const Cart = require( '../models/cartModel' );

const calcTotalPrice = ( cart ) => {
    let totalPrice = 0;
    cart.cartItems.forEach( ( item ) => {
        totalPrice += item.quantity * item.price;
    } );
    cart.totalCartPrice = totalPrice;
    cart.totalPriceAfterDiscount = undefined;
    return totalPrice;
};

// @desc    Add product to user cart
// @route   POST /api/v1/cart
// @access  protected/User
exports.addProductToCart = asyncHandler( async ( req, res, next ) => {
    const { productId, color } = req.body;
    const product = await Product.findById( productId );
    // 1 Get Cart for logged user
    let cart = await Cart.findOne( { user: req.user._id } );

    if ( !cart )
    {
        cart = await Cart.create( {
            user: req.user._id,
            cartItems: [ { product: productId, color, price: product.price } ],
        } );
    } else
    {
    // product exist in cart, update product quantity
        const productIndex = cart.cartItems.findIndex( ( item ) => item.product.toString() === productId && item.color === color );

        if ( productIndex > -1 )
        {
            const cartItem = cart.cartItems[ productIndex ];
            cartItem.quantity += 1;
            cart.cartItems[ productIndex ] = cartItem;
        } else
        {
        // product not in cart, push product to cart
            cart.cartItems.push( { product: productId, color, price: product.price } );
        }
    }
    // calculate total price
    calcTotalPrice(cart)
    
    await cart.save();

    res.status(200).json({ status: 'success', items: cart.cartItems.length, message: 'product added successfully to cart', data: cart });
} );

// @desc    get Logged user cart
// @route   GET /api/v1/cart
// @access  protected/User
exports.getLoggedUserCart = asyncHandler( async ( req, res, next ) => {
    const cart = await Cart.findOne( { user: req.user._id } );

    if ( !cart ) return next( new ApiError( `there is no cart available`, 404 ) );
    
    res.status( 200 ).json( { status: 'success', items: cart.cartItems.length, data: cart } );
} );

// @desc    remove specific item
// @route   DELETE /api/v1/cart/:itemId
// @access  protected/User
exports.removeSpecificCartItem = asyncHandler( async ( req, res, next ) => { 
    const cart = await Cart.findOneAndUpdate( {user: req.user._id},
        {
            $pull: {cartItems: {_id: req.params.itemId } },
        },
        { new: true }
    );
    calcTotalPrice( cart );
    await cart.save();

    res.status( 200 ).json( { status: 'success', items: cart.cartItems.length, data: cart } );
} );

// @desc    clear user cart
// @route   DELETE /api/v1/cart
// @access  protected/User
exports.clearUserCart = asyncHandler( async ( req, res, next ) => { 
    await Cart.findOneAndDelete( { user: req.user._id } );
    res.status( 204 ).send();
} );

// @desc    update specific item quantity
// @route   PUT /api/v1/cart/:itemId
// @access  protected/User
exports.updateCartItemQuantity = asyncHandler( async ( req, res, next ) => {
    const { quantity } = req.body;

    const cart = await Cart.findOne( { user: req.user._id } );
    if ( !cart ) return next( new ApiError( `there is no cart for this user: ${ req.user._id }` ), 404 );
    
    const itemIdex = cart.cartItems.findIndex(
        ( item ) => item._id.toString() === req.params.itemId
    );

    if ( itemIdex > -1 )
    {
        const cartItem = cart.cartItems[ itemIdex ];
        cartItem.quantity = quantity;
        cart.cartItems[itemIdex] = cartItem;
    } else
    {
        return next( new ApiError( `there is no item for this ID: ${ req.params.itemId }`, 404 ) );
    }

    calcTotalPrice( cart );
    await cart.save();

    res.status( 200 ).json( { status: 'success', items: cart.cartItems.length, data: cart } );
} );


// @desc    apply coupon
// @route   PUT /api/v1/cart/applyCoupon
// @access  protected/User
exports.applyCoupon = asyncHandler( async ( req, res, next ) => {
    //1 get coupon based on name and check its expiration date
    const coupon = await Coupon.findOne( {
        name: req.body.coupon, expire: { $gt: Date.now() },
    }
    );

    if ( !coupon ) return next( new ApiError( `Coupon is invalid or expired ` ) );
    //2 get logged user cart to get total cart price
    const cart = await Cart.findOne( { user: req.user._id } );
    const totalPrice = cart.totalCartPrice;

    //3 calculate total price after discount
    const priceAfterDiscount = ( totalPrice - ( totalPrice * coupon.discount ) / 100 ).toFixed( 2 );

    cart.totalPriceAfterDiscount = priceAfterDiscount;
    await cart.save();

    res.status( 200 ).json( { status: 'success', items: cart.cartItems.length, data: cart } );
} );
