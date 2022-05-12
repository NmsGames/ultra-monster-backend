const conn = require('../../config/db')

const userData = async(data) => { 
    try {
        console.log('data.customerEmail',data.customerEmail)
        if (data.customerPhone) {
            const sql     = `SELECT * FROM users WHERE LOWER(phone)= ? limit ?`;
            const results = await conn.query(sql, [data.customerPhone.toLowerCase(), 1]);
            const user  = (JSON.parse(JSON.stringify(results))[0]); 
            data    = user 
        } else { 
            data    = {}
        } 
        return data;

    } catch (err) {
        console.log(err)
    }
}

const fetchTransaction = async(data) => { 
    try { 
        if (data.orderId) {
            const sql     = `SELECT * FROM transactions WHERE order_id= ? limit ?`;
            const results = await conn.query(sql, [data.orderId, 1]);
            const transactions  = (JSON.parse(JSON.stringify(results))[0]); 
            data = transactions.transaction_id 
        } else { 
            data    = {}
        } 
        return data;

    } catch (err) {
        console.log(err)
    }
}
module.exports = {userData ,fetchTransaction}