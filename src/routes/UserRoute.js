const router = require('express').Router()
// import auth controller
const UserController = require('../controllers/UserController')
const profile = require('../upload/imageUpload')

// Import auth middleware
const Auth = require('../middleware/Auth')
//import validation
const check = require('../validation/CheckValidation')

// route list

router.post('/changePassword', Auth, check.changePasswordValidator(), UserController.changePassword)
router.get('/me/profile', Auth, UserController.myProfile)
router.get('/me/getUsers', UserController.getUsers)
router.post('/me/updateProfile', Auth, UserController.updateProfile)
router.post('/uploadProfile', UserController.uploadProfilePic)
router.get('/:id/avatar', check.AvatarValidation(), UserController.retrieveProfilePic)

module.exports = router