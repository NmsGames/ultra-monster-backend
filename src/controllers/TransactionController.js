const conn = require('../db/config')
const moment = require('moment');
const check = require('../validation/CheckValidation')
const crypto = require('crypto')
// const { checkUser } = require('../Comman')
let message = null
let status = 400
let response = {}
let errors = {}

// Add money function
const createTransaction = async (data) => {
    try {
        const sql1 = `INSERT INTO transactions Set ?`;
        const forms = {
            user_id: data.userId,
            order_id: data.orderId,
            txn_id: crypto.randomBytes(8).toString("hex"),
            currency: data.orderCurrency,
            txn_amount: data.orderAmount,
            txn_date: moment().format(),
            added_type: data.orderNote,
            local_txn_id: `${moment().format('YYYYMMDDHHmmss')}`,
            gateway_name: "CASHFREE"
        }
        let results = await conn.query(sql1, forms);
        response = (JSON.parse(JSON.stringify(results)));

        if (results) {
            status = 200
        } else {
            status = 400
        }
        return status
    } catch (err) {
        return status
    }
}

const updateTransactionStatus = async (data) => {
    try {
        const sql = `SELECT * FROM transactions WHERE order_id= ? limit ?`;
        const sql1 = `UPDATE transactions Set ?  WHERE transaction_id= ?`;
        const results = await conn.query(sql, [data.orderId, 1]);
        const transactions = (JSON.parse(JSON.stringify(results))[0]);
        const formsData = {
            status: (data.txStatus == 'SUCCESS') ? 1 : (data.txStatus == 'FAILED') ? 3 : 2,
            is_type: (data.txStatus == 'SUCCESS') ? 1 : (data.txStatus == 'FAILED') ? 3 : 2,
            txn_status: data.txStatus,
            txn_message: data.txMsg,
            txn_time: data.txTime,
            reference_id: data.referenceId,
            payment_mode: data.paymentMode,
            checkcum_signature: data.signature,
        }

        let results1 = await conn.query(sql1, [formsData, transactions.transaction_id]);
        const response = (JSON.parse(JSON.stringify(results1)));
        if (response) {
            status = 200
            message = "Success"
        } else {
            message = "Failed"
        }
        const rpdata = {
            status,
            message,
            response
        }
        return rpdata
    } catch (err) {
        console.log(err)
    }
}
// With draw request 
const withdrawRequest = async (req, res) => {
    try {
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
        const { user_id, request_amount, withdraw_mode } = req.body
        /**Check validation Error */
        const users = await checkUser(user_id)
        if (users.status === 200) {
            const sql1 = `SELECT * from bank_details WHERE user_id = ? LIMIT 1`;
            const results = await conn.query(sql1, [user_id]);
            if (results.length > 0) {
                const winning_amount = 200;
                if (winning_amount >= request_amount) {
                    const sql1 = `INSERT INTO transactions Set ?`;
                    const orderId = crypto.randomBytes(6).toString("hex");
                    const txn_id = crypto.randomBytes(8).toString("hex");
                    const forms = {
                        user_id: user_id,
                        order_id: orderId,
                        txn_id: txn_id,
                        currency: 'INR',
                        txn_message: 'Withdraw request submitted success',
                        txn_amount: request_amount,
                        txn_date: moment().format(),
                        added_type: 'Withdraw Request',
                        is_request_mode: withdraw_mode,
                        local_txn_id: `${moment().format('YYYYMMDDHHmmss')}`,
                        gateway_name: "Local",
                        is_type: 7,
                        status: 1
                    }
                    let results1 = await conn.query(sql1, forms);
                    if (results1) {
                        status = 201
                        message = "Withdraw request submitted"
                    } else {
                        status = 500
                        message = "Something went wrong! server side"
                    }
                } else {
                    status = 401
                    message = "Insufficient balance!"
                }
                // return status
            } else {
                status = 400
                message = "Sorry! Your bank details not exist"
            }

        } else {
            status = 400
            message = "Invalid user ID"
        }

        const responseData = {
            status,
            message
        }
        res.send(responseData)
    } catch (error) {
        res.send({ err: error })
    }
}


//User account details by id


const accountDetails = async (req, res) => {
    try {
        /**Check validation Error */
        let data;
        const errors = check.resultsValidator(req)
        if (errors.length > 0) {
            return res.status(400).json({
                method: req.method,
                status: res.statusCode,
                error: errors
            })
        }
        /** check user exist or not */
        const user_id = req.body.user_id;
        const sql = `SELECT * FROM users  WHERE user_id = ? limit ?`;
        const results = await conn.query(sql, [user_id, 1]);
        const user = (JSON.parse(JSON.stringify(results))[0]);
        if (user) {
            /** select the total amount of current user */
            const sql1 = `SELECT sum(txn_amount) as amount from transactions WHERE user_id= ? and status =1 group by user_id`;
            const results = await conn.query(sql1, [user_id]);
            const responses = (JSON.parse(JSON.stringify(results))[0]);
            message = 'Success'
            status = 200
            data = {
                total_cash_amount: responses.amount,
                username: user.username,
                phone: user.phone
            }
        }
        else {
            status = 404
            message = "User does not exist"
        }
        const responseData = {
            status,
            message,
            data: data,
            errors
        }
        res.send(responseData)
    } catch (error) {
        res.send({ err: error })
    }
}

// Transaction history current user 
// const transactionHistory = async (req, res) => {
//     try {
//         /**Check validation Error */
//         let data;
//         const errors = check.resultsValidator(req)
//         if (errors.length > 0) {
//             return res.status(400).json({
//                 method: req.method,
//                 status: res.statusCode,
//                 error: errors
//             })
//         }

//         /** check user exist or not */
//         const user_id = req.body.user_id;
//         const sql = `SELECT * FROM users  WHERE user_id = ? limit ?`;
//         const results = await conn.query(sql, [user_id, 1]);
//         const user = (JSON.parse(JSON.stringify(results))[0]);
//         if (user) {
//             const sql1 = `SELECT transaction_id,txn_amount,txn_status,txn_id,order_id from transactions WHERE user_id= ?`;
//             const results = await conn.query(sql1, [user_id]);
//             const responses = (JSON.parse(JSON.stringify(results)));
//             message = 'Success'
//             status = 200
//             data = responses
//         }
//         else {
//             status = 404
//             message = "User does not exist"
//         }
//         const responseData = {
//             status,
//             message,
//             data: data,
//             errors
//         }
//         res.send(responseData)
//     } catch (error) {
//         res.send({ err: error })
//     }
// }


const transactionHistory = async (req, res) => {
    // con
    try {
        let sql = `SELECT * FROM transactions;`;
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

const bankDetails = async (req, res) => {
    // con
    try {
        let sql = `SELECT * FROM bank_details`;
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

// Transaction history current user
const userTransactionHistory = async (req, res) => {
    try {

        /** check user exist or not */
        const sql1 = `SELECT * from transactions LEFT JOIN users ON transactions.user_id = users.user_id WHERE  transactions.is_type != 7`;
        const results = await conn.query(sql1);
        if (results.length > 0) {
            const responses = (JSON.parse(JSON.stringify(results)));
            message = 'Success'
            status = 200
            data = responses
        }
        else {
            status = 404
            message = "No transaction history"
        }
        const responseData = {
            status,
            message,
            data: data,
            errors
        }
        res.send(responseData)
    } catch (error) {
        res.send({ err: error })
    }
}

// Transaction history current user
const withdrawRequestHistory = async (req, res) => {
    try {

        /** check user exist or not */
        const sql1 = `SELECT * from transactions LEFT JOIN users ON transactions.user_id = users.user_id WHERE  transactions.is_type = 7`;
        const results = await conn.query(sql1);
        if (results.length > 0) {
            const responses = (JSON.parse(JSON.stringify(results)));
            message = 'Success'
            status = 200
            data = responses
        }
        else {
            status = 404
            message = "No Withdraw history"
        }
        const responseData = {
            status,
            message,
            data: data,
            errors
        }
        res.send(responseData)
    } catch (error) {
        res.send({ err: error })
    }
}

//Account Details
const usersAccoutDetails = async (req, res) => {
    try {
        /**Check validation Error */
        let data = {};
        /** select the total amount of current user */
        const sql1 = `SELECT * from bank_details LEFT JOIN users ON bank_details.user_id = users.user_id`;
        const results = await conn.query(sql1);
        if (results.length > 0) {
            const responses = (JSON.parse(JSON.stringify(results)));
            message = 'Success'
            status = 200
            data = responses
        }
        else {
            status = 404
            message = "No bank details history"
        }
        const responseData = {
            status,
            message,
            data: data,
            errors
        }
        res.send(responseData)
    } catch (error) {
        res.send({ err: error })
    }
}


module.exports = {
    accountDetails,
    usersAccoutDetails,
    createTransaction,
    transactionHistory,
    updateTransactionStatus,
    userTransactionHistory,
    withdrawRequestHistory,
    withdrawRequest,
    bankDetails
}