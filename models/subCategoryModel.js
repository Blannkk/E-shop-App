const mongoose = require( 'mongoose' );

const subCategorySchema = mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim: true,
        unique: [ true, 'SubCategory name must be unique' ],
        minlength: [ 2, 'Too short SubCategory name' ],
        maxlength: [ 32, 'Too long SubCategory name' ]
    },
    slug: {
        type: String,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [ true, 'SubCategory must belong to a main Category' ]
    }
}, { timestamps: true } );

module.exports = mongoose.model( 'SubCategory', subCategorySchema );