const mongoose = require('mongoose');
// 1- Create Schema
const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required : [ true, 'brand name required'],
    unique: [true, 'brand must be unique'],
    minlength: [3, 'Too short brand name'],
    maxlength: [32, 'Too long brand name'],
  },

  slug: {
    type: String,
    lowercase: true
  },
  image: String,

}, { timestamps: true } );
const setImageURL = ( doc ) => {
  if ( doc.image )
  {
    const imageUrl = `${ process.env.BASE_URL }/brands/${ doc.image }`;
    doc.image = imageUrl;
  }
};

// getOne , getAll, update
brandSchema.post( 'init', (doc) => {
  setImageURL( doc );
} );

// create
brandSchema.post( 'save', ( doc ) => {
  setImageURL( doc );
} );


// 2- Create model
const BrandModel = mongoose.model('Brand', brandSchema);

module.exports = BrandModel;