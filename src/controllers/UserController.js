const conn = require('../db/config')
const check = require('../validation/CheckValidation')
const bcrypt = require('bcrypt');
var path = require('path');

// Common variable
let message = null
let statusCode = 400
let error = {}
let uploadPath;
let prfoileFile;

const myProfile = async (req, res) => {

    try {

        if (req.user.avatar == null) req.user.avatar = 'Avatar/default.png';
        const responseData = {
            status: 200,
            message: 'Success',
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                avatarLink: `${req.protocol}://${req.headers.host}/${req.user.avatar}`,
            },
            error: null
        }
        res.send(responseData)
    } catch (error) {
        res.send({ message: 'Database error', err: error })
    }
}

const changePassword = async (req, res) => {

    try {
        /**Check validation Error */
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
        /** End Check validation Error */

        /** Check old Password or current password */
        const comparison = await bcrypt.compare(req.body.password, req.user.password)
        if (comparison) {
            if (req.body.newPassword === req.body.confirmPassword) {
                /** hash the paassword */
                const encryptedPassword = await bcrypt.hash(req.body.password, 10)
                let sql = "UPDATE users Set password= ? WHERE id= ?"
                const data = await conn.query(sql, [encryptedPassword, req.ID]);
                if (data) {
                    statusCode = 200
                    message = "Password change successfully"
                } else {
                    statusCode = 500
                    message = "Something went wrong"
                    error = "Database error"
                }
            } else {
                message = "Confirm Password does not match"
            }
        } else {
            statusCode = 401
            message = "Current Password does not match"
        }
        const responseData = {
            status: statusCode,
            message,
            errors: error
        }
        res.send(responseData)
    } catch (error) {
        res.send({ authLogin: error })
    }
}
/** END CHANGE PASSWORD */

const uploadProfilePic = async (req, res) => {
    // try {
    // const errors = check.resultsValidator(req)
    // if (errors.length > 0) {
    //     return res.status(400).json({
    //         method: req.method,
    //         status: res.statusCode,
    //         error: errors
    //     })
    // }
    if (!req.files || Object.keys(req.files).length == 0) {
        res.status(400).send({ status: statusCode, message: 'No file are uploaded' })
    }
    prfoileFile = req.files.avatar
    let reqPath = path.join(__dirname, '../../public')
    const imagUrl = `Avatar/${prfoileFile.name}`
    uploadPath = `${reqPath}/${imagUrl}`

    console.log(uploadPath, 'upadf')
    // const profile = await prfoileFile.mv(uploadPath)

    let sql = "UPDATE users Set avatar= ? WHERE id= ?"
    // const user = await conn.query(sql, [imagUrl, req.ID]);
    // if (false) {
    //     statusCode = 200
    //     message = 'Image uploaded success'
    // } else {
    //     statusCode = 500
    //     message = 'Unable to upload'
    // }

    // const responseData = {
    //     status: statusCode,
    //     message,
    //     errors: error
    // }
    res.send('responseData')
    // } catch (error) {
    //     res.send('error')
    // }

}
const retrieveProfilePic = async (req, res) => {

    try {

        let sql = `SELECT * FROM users WHERE id= ? limit ?`;
        let user = await conn.query(sql, [req.params.id, 1]);
        const usersRows = (JSON.parse(JSON.stringify(user))[0]);

        if (!usersRows || !usersRows.avatar) {
            throw new Error()
        }
        if (usersRows.avatar == null) usersRows.avatar = 'Avatar/default.png';
        const responseData = {
            status: 200,
            message: 'Success',
            avatarLink: `${req.protocol}://${req.headers.host}/${usersRows.avatar}`,
            errors: error
        }
        res.send(responseData)
    } catch (e) {
        res.status(404).send()
    }

}

//Me update profile
const updateProfile = async (req, res) => {

    try {
        /**Check validation Error */
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
        /** End Check validation Error */

        /** Check old Password or current password */


        if (req.body.newPassword === req.body.confirmPassword) {
            /** hash the paassword */
            const encryptedPassword = await bcrypt.hash(req.body.password, 10)
            let sql = "UPDATE users Set ? WHERE id= ?"
            const data = await conn.query(sql, [encryptedPassword, req.ID]);
            if (data) {
                statusCode = 200
                message = "Password change successfully"
            } else {
                statusCode = 500
                message = "Something went wrong"
                error = "Database error"
            }
        } else {
            message = "Confirm Password does not match"
        }

        const responseData = {
            status: statusCode,
            message,
            errors: error
        }
        res.send(responseData)
    } catch (error) {
        res.send({ authLogin: error })
    }
}


const getUsers = async (req, res) => {
    // con
    try {
        let sql = `SELECT * FROM users`;
        let user = await conn.query(sql);
        if (user.length > 0) {
            statusCode = 200;
            message = 'Success'
            const usersRows = (JSON.parse(JSON.stringify(user)));
            data = usersRows
        } else {
            statusCode = 404
            message = 'Users not found'
            data = {};
        }
        const responseData = {
            status: statusCode,
            message: message,
            data: data
        }
        res.send(responseData)
    } catch (e) {
        res.status(404).send('ERR')
    }

}

module.exports = {
    myProfile,
    changePassword,
    uploadProfilePic,
    retrieveProfilePic,
    updateProfile,
    getUsers
}