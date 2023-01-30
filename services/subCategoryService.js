const factory = require( './handlersFactory' );
const SubCategory = require( '../models/subCategoryModel' );


exports.createFilterObj = ( req, res, next ) => {
  let filterObject = {};
  if ( req.params.categoryId ) filterObject = { category: req.params.categoryId };
  req.filterObj = filterObject;
  next();
};

// @desc    get SubCategory
// @route   GET /api/v1/subcategories
// @access  public
exports.getSubCategories = factory.getAll( SubCategory );


exports.setCategoryIdToBody = ( req, res, next ) => {
  // nested route
  if ( !req.body.category ) req.body.category = req.params.categoryId;
  next();
};
// @desc    Create SubCategory
// @route   POST /api/v1/categories
// @access  private
exports.createSubCategory = factory.createOne( SubCategory );

// @desc    get specific SubCategory by id
// @route   GET /api/v1/subcategories/:id
// @access  public
exports.getSubCategory = factory.getOne( SubCategory );


// @desc    update specific SubCategory by id
// @route   PUT /api/v1/subcategories/:id
// @access  Private
exports.updateSubCategory = factory.updateOne( SubCategory );

// @desc    delete specific SubCategory by id
// @route   DELETE /api/v1/subcategories/:id
// @access  Private
exports.deleteSubCategory = factory.deleteOne( SubCategory );