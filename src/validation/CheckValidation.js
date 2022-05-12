const { validationResult, check } = require('express-validator')


// validate  the result 
const resultsValidator = (req) => {
  const messages = []
  if (!validationResult(req).isEmpty()) {
    const errors = validationResult(req).array()
    for (const i of errors) {
      messages.push(i.msg)
    }
  }
  return messages
}

// Register validation
const registerValidator = () => {
  return [
    check('email').notEmpty()
      .withMessage('Email is required!')
      .isEmail()
      .withMessage('Not valid email')
      .trim().escape(),
    check('password')
      .notEmpty().withMessage('password is required').isLength({ min: 6 })
      .withMessage('password must be greater 5 characters'),
    check('confirm_password')
      .notEmpty().withMessage('Confirm Password is required').isLength({ min: 6 })
      .withMessage('Confirm Password must be greater 5 characters')
  ]
}

//login Validation
const loginValidator = () => {
  return [
    check('email').notEmpty().withMessage('email is required'),
    check('password').notEmpty().withMessage('password is required')
  ]
}
//Forgot password validation
const sendOtp = () => {
  return [
    check('username').notEmpty().withMessage('username is required')
  ]
}

//Avatar validation
const AvatarValidation = () => {
  return [
    check('avatar').notEmpty().withMessage('Please upload avatar')
  ]
}

//Change password validation
const changePasswordValidator = () => {
  return [
    check('password').notEmpty().withMessage('Old password is required'),
    check('newPassword')
      .trim()
      .notEmpty()
      .withMessage('Password is required!')
      .isLength({ min: 6, max: 16 })
      .withMessage('Password must be between 6 to 16 characters')
  ]
}
//Otp verify validation
const forgotPasswordValidator = () => {
  return [
    check('email').notEmpty().trim().
      withMessage('Email is required')
      .isEmail()
      .withMessage('Email is not valid!')
  ]
}
//Otp verify validation
const resetPasswordValidator = () => {
  return [
    check('email').notEmpty().trim().isEmail().withMessage('Email is Required'),
    check('otp').notEmpty().withMessage('Otp is required'),
    check('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required!')
      .isLength({ min: 6, max: 16 })
      .withMessage('Password must be between 6 to 16 characters'),
    check('confirm_password')
      .trim()
      .notEmpty()
      .withMessage('Confirm Password is required!')

  ]
}
const addMoneyValidator = () => {
  return [
    check('orderAmount').notEmpty().trim().withMessage('Amount is required'),
    check('customerPhone').notEmpty().trim().withMessage('Phone is required').isInt()
      // Custom message
      .withMessage('Mobile is not valid'),
    check('customerEmail').notEmpty().trim().withMessage('Email is required')
      .isEmail().withMessage('Email is not valid'),
    check('customerName').notEmpty().trim().withMessage('Name is required')
  ]
}
const userIdValidator = () => {
  return [
    check('user_id').notEmpty().trim().withMessage('User Id is required')
      .isInt()
      .withMessage('Enter valid Id')
  ]
}

//Pan validation
const panCardValidator = () => {
  return [
    check('user_id').notEmpty().trim().withMessage('User Id is required')
      .isInt()
      .withMessage('Enter valid Id'),
    check('pan_card_number').notEmpty().trim().withMessage('Pan Card number is required'),
    check('pan_card_name').notEmpty().trim().withMessage('Per PAN name is required'),
    check('pan_card_dob').notEmpty().trim().withMessage('DOB is required')
  ]
}

//DL validation
const dlCardValidator = () => {
  return [
    check('user_id').notEmpty().trim().withMessage('User Id is required')
      .isInt()
      .withMessage('Enter valid Id'),
    check('dl_card_number').notEmpty().trim().withMessage('DL number is required'),
    check('dl_card_name').notEmpty().trim().withMessage('Full name as per Driving License'),
    check('dl_card_dob').notEmpty().trim().withMessage('DOB is required')
  ]
}
//Voter validation
const voterCardValidator = () => {
  return [
    check('user_id').notEmpty().trim().withMessage('User Id is required')
      .isInt()
      .withMessage('Enter valid Id'),
    check('voter_card_number').notEmpty().trim().withMessage('Voter ID number is required'),
    check('voter_card_name').notEmpty().trim().withMessage('Full name as per Voter ID Card'),
    check('voter_card_dob').notEmpty().trim().withMessage('DOB is required')
  ]
}


//Withdraw request validator
// Register validation
const withdrawRequestVal = () => {
  return [
    check('user_id').notEmpty().isInt()
      .withMessage('User ID is required!')
      .trim().escape(),
    check('request_amount')
      .notEmpty().withMessage('Withdraw money request should not be empty'),
    check('withdraw_mode')
      .notEmpty().withMessage('Withdraw Mode type should not be empty')
  ]
}

const BankValidator = () => {
  return [
    check('user_id').notEmpty().isInt()
      .withMessage('User ID is required!')
      .trim().escape(),
    check('account_holder_name').trim().escape()
      .notEmpty().withMessage('A/C holder name is required'),
    check('ifsc_code').trim().escape()
      .notEmpty().withMessage('IFSC code is required'),
    check('account_number').trim().escape()
      .notEmpty().withMessage('A/C number is required'),
    check('confirm_account_number').trim().escape()
      .notEmpty().withMessage('Confirm A/C number is required'),
  ]
}
// Register validation
const frientValidator = () => {
  return [
    check('from_player_id').notEmpty()
      .withMessage('From player id is required!')
      .trim().escape(),
    check('to_player_id').notEmpty()
      .withMessage('To player id is required!')
      .trim().escape(),
  ]
}
const updValidator = () => {
  return [
    check('user_id').notEmpty()
      .withMessage('User id is required!')
      .trim().escape(),
  ]
}
module.exports = {
  updValidator,
  userIdValidator,
  withdrawRequestVal,
  BankValidator,
  addMoneyValidator,
  loginValidator,
  registerValidator,
  resultsValidator,
  sendOtp,
  AvatarValidation,
  changePasswordValidator,
  forgotPasswordValidator,
  panCardValidator,
  voterCardValidator,
  dlCardValidator,
  frientValidator,
  resetPasswordValidator
}
