const express = require( 'express' );

const { createSubCategory,
     getSubCategory,
     getSubCategories, 
    updateSubCategory,
    deleteSubCategory,
    setCategoryIdToBody,
    createFilterObj
}
    = require( '../services/subCategoryService' );

const { createSubCategoryValidator,
    getSubCategoryValidator,
    updateSubCategoryValidator,
    deleteSubCategoryValidator
} = require( '../utils/validators/subCategoryValidator' );
const authService = require( '../services/authService' );

// mergeParams allow us to access parameters on other router
const router = express.Router({mergeParams: true});

router.route( "/" )
    .get(createFilterObj,getSubCategories)
    .post(authService.protect, authService.allowedTo('admin', 'manger'), setCategoryIdToBody ,createSubCategoryValidator, createSubCategory );

router.route( '/:id' )
    .get( getSubCategoryValidator, getSubCategory )
    .put(authService.protect, authService.allowedTo('admin', 'manger'), updateSubCategoryValidator, updateSubCategory )
    .delete(authService.protect, authService.allowedTo('admin'), deleteSubCategoryValidator, deleteSubCategory );

module.exports = router;