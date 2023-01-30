const express = require( 'express' );
const { getUserValidator,
     createUserValidator,
     updateUserValidator,
    deleteUserValidator,
    updateLoggedUserValidator
    } =
require( '../utils/validators/userValidator' );


const {
    getUser,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    uploadUserImage,
    resizeImage,
    ChangeUserPassword,
    getLoggedUserDate,
    updateLoggedUserPassword,
    updateLoggedUserData,
    deactivateLoggedUser
} = require( '../services/userService' );
const authService = require( '../services/authService' );
      
const router = express.Router();

router.use( authService.protect );

router.get( '/getMe',  getLoggedUserDate, getUser );
router.put( '/changeMyPassword', updateLoggedUserPassword );
router.put( '/updateMe', updateLoggedUserValidator, updateLoggedUserData );
router.delete( '/deleteMe', deactivateLoggedUser );

router.use(authService.allowedTo('admin', 'manger'))

router.put( '/changepassword/:id', ChangeUserPassword );

router.route( '/' )
    .get( getUsers )
    .post(uploadUserImage, resizeImage, createUserValidator, createUser );

router.route( '/:id' )
    .get(  getUserValidator, getUser )
    .put( uploadUserImage, resizeImage, updateUserValidator, updateUser )
    .delete( deleteUserValidator, deleteUser )

module.exports = router