const mongoose = require( 'mongoose' );

const orderSchema = new mongoose.Schema( {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cartItems: [
        {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'order must be belong to a user']
        },
        quantity:  Number,
        color: String,
        price: Number,
    
        },
    ],
    taxPrice: {
        type: Number,
        default: 0,
    },
    shippingPrice: {
        type: Number, 
        default: 0
    },
    totalOrderPrice: {
        type: Number,
        default: 0,
    },
    paymentMethod: {
        type: String,
        enum: [ 'card', 'cash' ],
        default: 'cash',
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: Date,
    },
    { timestamps: true }
);

orderSchema.pre( /^find/, function ( next ) {
    this.populate( { path: 'user', select: ' name email phone' } )
        .populate( { path: 'cartItems.product', select: ' title imageCover' } );
    next();
} );

module.exports = mongoose.model( 'Order', orderSchema );