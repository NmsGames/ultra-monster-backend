const router = require('express').Router()
const config = require('../config.json');
const enums = require('../helpers/enums');
const helpers = require('../helpers/signatureCreation');
const transaction = require('../controllers/TransactionController')
const check = require('../validation/CheckValidation')
// const { sendResponse } = require('../../services/AppService')
const conn = require('../db/config')
const crypto = require("crypto");




//user transaction history
router.post('/withdrawRequest', check.withdrawRequestVal(), transaction.withdrawRequest);
router.get('/userTransactionHistory', transaction.userTransactionHistory);
//user transaction history
router.get('/withdrawRequestHistory', transaction.withdrawRequestHistory);
router.post('/accountDetails', check.userIdValidator(), transaction.accountDetails);
router.get('/transactionHistory', transaction.transactionHistory);
router.get('/usersAccoutDetails', transaction.usersAccoutDetails);
router.get('/bankDetails', transaction.bankDetails);



/**ADD MONEY */
router.get('/', async (req, res, next) => {
    const user_id = req.query.user_id
    const amount = req.query.amount
    const phone = req.query.phone
    let data = {};
    let status = 404
    let message
    try {
        if (!user_id) {
            status = 404
            message = "User ID should not be empty!"
        } else {
            if (!amount) {
                status = 404
                message = "Amount should not be empty!"
            } else if (!phone) {
                status = 400
                message = "Phone Number should not empty!"
            } else {
                let sql = `SELECT * FROM users WHERE user_id= ? limit ?`;
                let users = await conn.query(sql, [user_id, 1]);
                if (users.length > 0) {
                    /**
                     * Call the payment api
                     */
                    if ((users[0].email == null)) {
                        status = 400
                        message = "Please update your profile email missing!"
                    }
                    else {
                        const orderId = crypto.randomBytes(6).toString("hex");
                        status = 200

                        //payment parameter
                        let formObj = {
                            orderId: orderId,
                            orderAmount: amount,
                            customerPhone: phone,
                            customerEmail: users[0].email
                        }
                        //Secret ke
                        const secretKey = config.secretKey;
                        let { paymentType } = { paymentType: 'CHECKOUT' }

                        const notifyUrl = ""
                        const returnUrl = "http://localhost:5000/success"
                        const dataObj = {
                            userId: user_id,
                            orderId: formObj.orderId,
                            orderAmount: formObj.orderAmount,
                            customerPhone: formObj.customerPhone,
                            customerEmail: formObj.customerEmail,
                            // customerName    : formObj.customerName,
                            orderCurrency: "INR",
                            notifyUrl: notifyUrl,
                            returnUrl: returnUrl,
                            orderNote: "Added Amount",
                            appId: config.appId
                        }
                        //SAVE Transactions in database
                        const transctions = await transaction.createTransaction(dataObj);
                        if (transctions === 200) {
                            switch (paymentType) {
                                case enums.paymentTypeEnum.checkout: {
                                    formObj.returnUrl = returnUrl;
                                    formObj.notifyUrl = "";
                                    formObj.appId = config.appId;
                                    const signature = helpers.signatureRequest1(formObj, secretKey);
                                    additionalFields = {
                                        returnUrl,
                                        notifyUrl,
                                        signature,
                                        appId: config.appId,
                                    };

                                    return res.status(200).render("redirect", { signature: signature, app: config.appId, email: formObj.customerEmail, orderId: formObj.orderId });
                                }

                                default: {
                                    console.log("incorrect payment option recieved");
                                    console.log("paymentOption:", paymentType);
                                    return res.status(200).send({
                                        status: "error",
                                        message: "incorrect payment type sent"
                                    });
                                }
                            }
                        } else {
                            status = 404
                            message = "Transactions failed due to invalid details!"
                        }
                    }

                } else {
                    status = 404
                    message = "Sorry! User ID is not valid"
                }

            }
        }
        return res.send({ status, message, data })
    } catch (error) {
        return res.status(500).send('Server error')
    }
});





//below will not be hit as server is not on https://
router.post('/notify', (req, res, next) => {
    return res.status(200).send({
        status: "success",
    })
});


module.exports = router