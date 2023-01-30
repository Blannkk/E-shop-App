const express = require( 'express' );



const { addAddress, removeAddress, getLoggedUserAddressesList } = require( '../services/addressService' );

const authService = require( '../services/authService' );

const router = express.Router();

router.use(authService.protect, authService.allowedTo( 'user' ))
router.route('/')
    .post( addAddress )
    .get( getLoggedUserAddressesList);

router
    .delete('/:addressId', removeAddress )


module.exports = router