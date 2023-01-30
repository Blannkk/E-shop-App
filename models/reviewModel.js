const mongoose = require( 'mongoose' );
const Product = require( './productModel' );

const reviewSchema = new mongoose.Schema( {
    title: {
        type: String,
    },
    ratings: {
        type: Number,
        min: [ 1, 'min ratings value is 1.0' ],
        max: [ 5, 'max ratings value is 5.0']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'review must belong to a user']
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [ true, 'review must belong to a product' ]
    }
}, { timestamps: true } );

reviewSchema.pre( /^find/, function ( next ) {
    this.populate( { path: 'user', select: 'name' } );
    next();
} );

reviewSchema.statics.calcAverageRatingsAndQuantity = async function ( productId ) {
    const result = await this.aggregate( [
        {
            $match: { product: productId },
        },
        {
            $group: {
                _id: 'product',
                avgRatings: { $avg: '$ratings' },
                ratingsQuantity: { $sum: 1 }
            }
        }
    ] );

    if ( result.length > 0 )
    {
        await Product.findByIdAndUpdate( productId, {
            ratingsAverage: result[ 0 ].avgRatings,
            ratingsQuantity: result[ 0 ].ratingsQuantity
        } );
    } else
    {
        await Product.findByIdAndUpdate( productId, {
            ratingsAverage: 0,
            ratingsQuantity: 0
        } );
    }
};

reviewSchema.post( 'save', async function () {
    await this.constructor.calcAverageRatingsAndQuantity( this.product );
} );

reviewSchema.post( 'remove', async function () {
    await this.constructor.calcAverageRatingsAndQuantity( this.product );
} );

module.exports = mongoose.model('Review', reviewSchema);