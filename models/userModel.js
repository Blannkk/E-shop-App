const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcryptjs' );

const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        trim: true, 
        required: [true, 'name is required'],
    },
    slug: {
        type: String,
        lowercase: true,
    },
    email: {
        type: String,
        required: [ true, 'email is required' ],
        unique: true,
        lowercase: true,
    },
    phone: String,
    profileImg: String,
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [ 8, 'too short password' ],
    },
    active: {
        type: Boolean,
        default: true,
    },
    passwordChangedAt: { type: Date },
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        }
    ],
    addresses: [
        {
            id: { type: mongoose.Schema.Types.ObjectId },
            alias: String,
            details: String,
            phone: String,
            city: String,
            postalCode: String,
        }
    ] , 
    role: {
        type: String,
        enum: [ 'user', 'manger', 'admin' ],
        default: 'user'
    },
}, { timestamps: true } );

userSchema.pre( 'save', async function ( next ) {
    if ( !this.isModified( 'password' ) ) return next();
    // hashing user password
    this.password = await bcrypt.hash( this.password, 12 );
    next();
} );
const User = mongoose.model( 'User', userSchema );

module.exports = User;

