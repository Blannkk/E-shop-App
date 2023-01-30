const asyncHandler = require( 'express-async-handler' );
const ApiError = require( '../utils/apiError' );
const ApiFeatures = require( '../utils/apiFeatures' );

exports.deleteOne = ( Model ) => asyncHandler( async ( req, res, next ) => {
    const { id } = req.params;
  
    const doc = await Model.findByIdAndDelete( id );
  
    if ( !doc )
    {
      return next( new ApiError( `No doc for this id ${ id }`, 404 ) );
  }
  
  // Trigger the "remove" event when the doc is deleted;
    doc.remove();
    res.status( 204 ).send();
} );
  
exports.updateOne = ( Model ) => asyncHandler( async(req, res, next) => {
  const { id } = req.params;

  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, 
    {new: true});

    if (!doc) {
      return next(new ApiError(`No doc for this id ${id}`, 404));
    }

  // Trigger the "save" event when the doc is updated;
  doc.save();
  res.status(200).json({data: doc})
} );

exports.createOne = (Model) => asyncHandler( async(req, res) => {
  const doc = await Model.create(req.body)
  return res.status( 201 ).json( { data: doc } );
} );

exports.getOne = ( Model, populateOpt ) => asyncHandler( async ( req, res, next ) => {
  const { id } = req.params;
  // build query 
  let query = Model.findById( id );
  if ( populateOpt )
  {
    query = query.populate( populateOpt );
  }

  //execute query
  const doc = await query;
  if ( !doc )
  {
    return next( new ApiError( `No doc for this id ${ id }`, 404 ) );
  }
  
  res.status( 200 ).json( { data: doc } );
} );

exports.getAll = ( Model, modelName = '' ) => asyncHandler( async ( req, res ) => {
  let filter = {};
  if ( req.filterObj )
  {
    filter = req.filterObj ;
  }
  //build query
  const documentsCounts = await Model.countDocuments();
  const apiFeatures = new ApiFeatures( Model.find(filter), req.query )
    .paginate(documentsCounts)
    .limitFields()
    .filter()
    .search(modelName)
    .sort()
  
  //execute query
  const {mongooseQuery, paginationResult} = apiFeatures
  const docs = await mongooseQuery;

  res.status(200).json({results: docs.length, paginationResult ,data: docs})
});