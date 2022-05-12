const bcrypt = require('bcrypt');
const check = require('../validation/CheckValidation')
const Token = require('../middleware/AuthToken')
const conn = require('../db/config')
const mail = require('../mail/config')
const nodemailer = require('nodemailer');
const { sendResponse } = require('../AppServices')

const nodemail = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "9da5b7ba6396ab",
        pass: "2a152b1fc0ef34"
    }
});
/**
 * Desc : User exist or not by phone no  
 * Req  :{ user_id}
 * Function : loggedInUser
 */
const checkUserById = async (req) => {
    let status;
    let data = {};
    const { user_id } = req
    if (!user_id) return sendResponse(status = 404, "Invalid details ID.", data)

    //check user
    let sql = `SELECT * FROM users WHERE user_id=? limit ?`;
    let check = await conn.query(sql, [user_id, 1]);
    console.log(check, 'check')
    if (check.length > 0) {
        data = {
            status: 200,
            user_id: check[0].user_id,
            username: check[0].username

        }
    } else {
        data = {
            status: 403
        }
    }
    return data
    // return sendResponse(status = 200, message, data)
}

/**
 * request - referral_code
 * response - referral_cod & id
 */
const checkReferralCode = async (referral_code) => {
    // Check same username exist or not  
    let sql = `SELECT * FROM referrals_table WHERE LOWER(referral_code)= ? limit ?`;
    let referrals = await conn.query(sql, [referral_code.toLowerCase(), 1]);
    if (referrals.length > 0) {
        if (referrals[0].is_status === 2) {
            return 208
        }
        const data = {
            referral_id: referrals[0].referral_id,
            referral_code: referrals[0].referral_code,
        }
        return data
    } else {
        return false;
    }
}

/**
 * request - username
 * response - referral_cod & id
 */
const checkUsers = async (username) => {
    // Check same username exist or not 
    let sql = `SELECT * FROM users WHERE LOWER(username) = ? limit ?`;
    let user = await conn.query(sql, [username.toLowerCase(), 1]);
    if (user.length > 0) {
        const data = {
            username: user[0].username,
            user_id: user[0].user_id,
            password: user[0].password
        }
        return data
    } else {
        return false;
    }
}
/**
 * request - referral_code,username,password
 * response - register success
 */
const authSignUp = async (req, res) => {
    let message = null
    let statusCode = 400
    let error = {}
    let data;
    try {
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
        const { username, referral_code } = req.body
        //hash the paassword
        const encryptedPassword = await bcrypt.hash(req.body.password, 10)


        // Check same referrl code exist or not 
        const users = await checkUsers(username);
        if (users) {
            statusCode = 208
            message = `${username} is already exist`
            const referrals = checkReferralCode(referral_code);
        } else {
            const referrals = await checkReferralCode(referral_code);
            if (referrals) {
                if (referrals === 208) {
                    statusCode = 404
                    message = `Refferal code time expired!`
                } else {
                    const formData = {
                        username: username,
                        password: encryptedPassword,
                        referral_id: referrals.referral_id
                    };
                    let sql = `INSERT INTO users set ?`;
                    let user = await conn.query(sql, formData)
                    if (user) {
                        statusCode = 201
                        message = `${username} is create successfully`
                    } else {
                        statusCode = 500
                        message = `Something went wrong!`
                        error = `Database error`
                    }
                }

            } else {
                statusCode = 404
                message = `Referral code is invalid`
            }

        }
        res.send(sendResponse(statusCode, message, data))
        // res.send(responseData) 
    } catch (error) {
        if (error) throw error;
        res.send(error);
    }
}

const authLogin = async (req, res) => {
    let message = null
    let statusCode = 400
    let data = {};
    try {
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } else {
            const { username, password } = req.body
            // Check requeted user is exist or not
            const users = await checkUsers(username);
            if (users) {
                const comparison = await bcrypt.compare(password, users.password)
                if (comparison) {
                    statusCode = 200
                    message = 'Login success'
                    data = {
                        user_id: users.user_id,
                        username: users.username
                    }
                } else {
                    statusCode = 401
                    message = 'Login failed'
                    data.password = "Password does not match!"
                }
            } else {
                statusCode = 404
                message = 'Login failed'
                data.password = "Username does not exist!"
            }

            res.send(sendResponse(statusCode, message, data))
        }
    } catch (error) {
        res.send(sendResponse(500, 'Database error', data))
    }
}


//Forgot Password 
const sendOtp = async (req, res) => {
    let message = null
    let statusCode = 400
    let error = {}
    try {

        const formData = {
            username: req.body.username,
            email: '',
            password: req.body.password
        };

        // Check requeted user is exist or not
        let sql = `SELECT * FROM users WHERE LOWER(username)= ? limit ?`;
        let user = await conn.query(sql, [formData.username.toLowerCase(), 1]);
        // console.log('user',user)
        if (user.length > 0) {
            const usersRows = (JSON.parse(JSON.stringify(user))[0]);
            var otp = Math.floor(1000 + Math.random() * 9000);
            mailOptions = {
                from: "@nmsgames.com",
                to: "rajedraakmr@email.com",
                subject: "One time password",
                text: `This Mail is sent with the help of two-step verification<br>
                Please enter the mention otp , ${otp}.`
            }
            let date_ob = new Date();
            const verifyotp_time = date_ob.getTime()
            const updateData = {
                otp,
                verifyotp_time
            }
            let info = await nodemail.sendMail(mailOptions)
            if (info) {
                let sql = "UPDATE users Set ?  WHERE id= ?"
                await conn.query(sql, [updateData, usersRows.id]);
                message = 'Please check your mail otp has been sent'
                statusCode = 200
            } else {
                message = 'Something went wrong'
                statusCode = 500
                error = "Database error"
            }
        } else {
            statusCode = 404
            message = 'Not found'
            error.password = "Username does not exist please enter correct name!"
        }
        const responseData = {
            status: statusCode,
            message,
            errors: error
        }
        res.send(responseData)
    } catch (error) {
        res.send({ error: error })
    }
}

//Forgot Password 
const forgotPassword = async (req, res) => {
    let message = null
    let statusCode = 400
    let data = {}
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rahulkumar@nmsgames.com',
                pass: 'lyszrpneixiqhpxv',
            },
        });
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } else {
            const { email } = req.body
            let sql = `SELECT * FROM users WHERE LOWER(email)= ? limit ?`;
            let user = await conn.query(sql, [email.toLowerCase(), 1]);
            if (user.length > 0) {
                const otp = Math.floor(1000 + Math.random() * 9999);
                const last_minute = moment().format("YYYY-MM-DD HH:mm:ss");
                //Sent mail
                transporter.sendMail({
                    from: '"Ultra Monster OTP!" <rahulkumar@nmsgames.com>', // sender address
                    to: email, // list of receivers
                    subject: "OTP Verfications", // Subject line 
                    html: `<b>The OTP is ${otp}. <br>This OTP generated at ${last_minute} and valid for 5 Minutes.</b>`, // html body
                }).then(info => {
                    console.log({ info });
                }).catch(console.error);
                const formData = {
                    otp: otp,
                    otp_time: last_minute
                };
                let sql1 = "UPDATE users Set ? WHERE email= ?"
                await conn.query(sql1, [formData, email])
                statusCode = 200
                message = 'Otp have sent on your registered email!'
                const usersRows = (JSON.parse(JSON.stringify(user))[0]);
                data = {
                    user_id: usersRows.user_id,
                    email: usersRows.email,
                    phone: usersRows.phone,
                }

            } else {
                statusCode = 404
                message = 'Sorry! Email does not exist!'
            }
            const responseData = {
                status: statusCode,
                message,
                data
            }
            res.send(responseData)
        }
    } catch (error) {
        res.send({ error: error })
    }
}


//Forgot Password 
const forgotUserName = async (req, res) => {
    let message = null
    let statusCode = 400
    let data = {}
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rahulkumar@nmsgames.com',
                pass: 'lyszrpneixiqhpxv',
            },
        });
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        } else {
            const { email } = req.body
            let sql = `SELECT * FROM users WHERE LOWER(email)= ? limit ?`;
            let user = await conn.query(sql, [email.toLowerCase(), 1]);
            if (user.length > 0) {
                const otp = Math.floor(1000 + Math.random() * 9999);
                const last_minute = moment().format("YYYY-MM-DD HH:mm:ss");
                //Sent mail
                transporter.sendMail({
                    from: '"Ultra Monster OTP!" <rahulkumar@nmsgames.com>', // sender address
                    to: email, // list of receivers
                    subject: "OTP Verfications", // Subject line 
                    html: `<b>The OTP is ${otp}. <br>This OTP generated at ${last_minute} and valid for 5 Minutes.</b>`, // html body
                }).then(info => {
                    console.log({ info });
                }).catch(console.error);
                const formData = {
                    otp: otp,
                    otp_time: last_minute
                };
                let sql1 = "UPDATE users Set ? WHERE email= ?"
                await conn.query(sql1, [formData, email])
                statusCode = 200
                message = 'Otp have sent on your registered email!'
                const usersRows = (JSON.parse(JSON.stringify(user))[0]);
                data = {
                    user_id: usersRows.user_id,
                    email: usersRows.email,
                    phone: usersRows.phone,
                }

            } else {
                statusCode = 404
                message = 'Sorry! Email does not exist!'
            }
            const responseData = {
                status: statusCode,
                message,
                data
            }
            res.send(responseData)
        }
    } catch (error) {
        res.send({ error: error })
    }
}

module.exports = {
    authLogin,
    authSignUp,
    sendOtp,
    forgotPassword,
    forgotUserName

}